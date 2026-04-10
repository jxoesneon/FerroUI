use async_trait::async_trait;
use futures_util::StreamExt;
use reqwest::Client;
use serde::{Deserialize, Serialize};
use std::pin::Pin;
use futures_util::Stream;

#[async_trait]
pub trait LlmProvider: Send + Sync {
    async fn complete_prompt(&self, request: LlmRequest) -> Result<String, Box<dyn std::error::Error + Send + Sync>>;
    async fn process_prompt(&self, request: LlmRequest) -> Result<Pin<Box<dyn Stream<Item = String> + Send>>, Box<dyn std::error::Error + Send + Sync>>;
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct LlmRequest {
    pub system_prompt: String,
    pub user_prompt: String,
    pub temperature: f32,
}

pub struct OpenAiProvider {
    client: Client,
    api_key: String,
    model: String,
}

impl OpenAiProvider {
    pub fn new(api_key: String, model: String) -> Self {
        Self {
            client: Client::new(),
            api_key,
            model,
        }
    }
}

#[async_trait]
impl LlmProvider for OpenAiProvider {
    async fn complete_prompt(&self, request: LlmRequest) -> Result<String, Box<dyn std::error::Error + Send + Sync>> {
        let response = self.client.post("https://api.openai.com/v1/chat/completions")
            .header("Authorization", format!("Bearer {}", self.api_key))
            .json(&serde_json::json!({
                "model": self.model,
                "messages": [
                    {"role": "system", "content": request.system_prompt},
                    {"role": "user", "content": request.user_prompt}
                ],
                "temperature": request.temperature
            }))
            .send()
            .await?;

        let json: serde_json::Value = response.json().await?;
        Ok(json["choices"][0]["message"]["content"].as_str().unwrap_or("").to_string())
    }

    async fn process_prompt(&self, request: LlmRequest) -> Result<Pin<Box<dyn Stream<Item = String> + Send>>, Box<dyn std::error::Error + Send + Sync>> {
        let response = self.client.post("https://api.openai.com/v1/chat/completions")
            .header("Authorization", format!("Bearer {}", self.api_key))
            .json(&serde_json::json!({
                "model": self.model,
                "messages": [
                    {"role": "system", "content": request.system_prompt},
                    {"role": "user", "content": request.user_prompt}
                ],
                "temperature": request.temperature,
                "stream": true
            }))
            .send()
            .await?;

        let stream = response.bytes_stream().map(|res| {
            match res {
                Ok(bytes) => {
                    let s = String::from_utf8_lossy(&bytes).to_string();
                    // Basic parsing of OpenAI stream format
                    // data: {"choices": [{"delta": {"content": "..."}}]}
                    let mut content = String::new();
                    for line in s.lines() {
                        if line.starts_with("data: ") && line != "data: [DONE]" {
                            if let Ok(json) = serde_json::from_str::<serde_json::Value>(&line[6..]) {
                                if let Some(delta_content) = json["choices"][0]["delta"]["content"].as_str() {
                                    content.push_str(delta_content);
                                }
                            }
                        }
                    }
                    content
                }
                Err(_) => String::new(),
            }
        });

        Ok(Box::pin(stream))
    }
}
