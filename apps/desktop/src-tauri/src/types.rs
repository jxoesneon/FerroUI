use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct FerroUIComponent {
    pub r#type: String,
    pub id: Option<String>,
    pub props: Option<HashMap<String, serde_json::Value>>,
    pub children: Option<Vec<FerroUIComponent>>,
    pub action: Option<serde_json::Value>,
    pub aria: Option<serde_json::Value>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct FerroUILayout {
    pub schema_version: String,
    pub request_id: String,
    pub locale: String,
    pub layout: FerroUIComponent,
    pub metadata: Option<serde_json::Value>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(tag = "type", rename_all = "snake_case")]
pub enum EngineChunk {
    Phase { phase: u8, content: String },
    ToolCall { name: String, args: serde_json::Value },
    ToolOutput { name: String, result: serde_json::Value },
    LayoutChunk { layout: Option<FerroUILayout>, content: Option<String> },
    Error { code: String, message: String, retryable: bool },
    Complete { content: Option<String> },
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct RequestContext {
    pub user_id: String,
    pub request_id: String,
    pub permissions: Vec<String>,
}
