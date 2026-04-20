---
title: FerroUILayout JSON Schema
outline: deep
---

# FerroUILayout JSON Schema

The `FerroUILayout` schema is the root contract between the FerroUI engine and any renderer. Every layout produced by the engine is validated against this schema before the first byte reaches the client.

This page publishes the **canonical JSON Schema** emitted from the live Zod definition in `@ferroui/schema`. For the annotated prose version, see [FerroUILayout Specification](/engineering/backend/FerroUILayout_JSON_Schema_Specification).

## Full Schema

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "schemaVersion": {
      "default": "1.1.0",
      "type": "string",
      "pattern": "^\\d+\\.\\d+(\\.\\d+)?$"
    },
    "requestId": {
      "type": "string",
      "format": "uuid",
      "pattern": "^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$"
    },
    "locale": {
      "type": "string",
      "pattern": "^[a-z]{2}(-[A-Z][a-z]{3})?(-[A-Z]{2})?$"
    },
    "layout": {
      "$ref": "#/$defs/__schema0"
    },
    "metadata": {
      "type": "object",
      "properties": {
        "generatedAt": {
          "type": "string",
          "format": "date-time",
          "pattern": "^(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))T(?:(?:[01]\\d|2[0-3]):[0-5]\\d(?::[0-5]\\d(?:\\.\\d+)?)?(?:Z))$"
        },
        "model": {
          "type": "string"
        },
        "provider": {
          "type": "string"
        },
        "latencyMs": {
          "type": "number",
          "minimum": 0
        },
        "repairAttempts": {
          "type": "number",
          "minimum": 0
        },
        "cacheHit": {
          "type": "boolean"
        }
      },
      "required": [
        "generatedAt"
      ],
      "additionalProperties": false
    }
  },
  "required": [
    "schemaVersion",
    "requestId",
    "locale",
    "layout"
  ],
  "additionalProperties": false,
  "$defs": {
    "__schema0": {
      "type": "object",
      "properties": {
        "type": {
          "type": "string",
          "minLength": 1
        },
        "id": {
          "type": "string"
        },
        "props": {
          "type": "object",
          "propertyNames": {
            "type": "string"
          },
          "additionalProperties": {}
        },
        "children": {
          "type": "array",
          "items": {
            "$ref": "#/$defs/__schema0"
          }
        },
        "action": {
          "oneOf": [
            {
              "type": "object",
              "properties": {
                "type": {
                  "type": "string",
                  "const": "NAVIGATE"
                },
                "payload": {
                  "type": "object",
                  "properties": {
                    "path": {
                      "type": "string",
                      "minLength": 1
                    },
                    "params": {
                      "type": "object",
                      "propertyNames": {
                        "type": "string"
                      },
                      "additionalProperties": {}
                    }
                  },
                  "required": [
                    "path"
                  ],
                  "additionalProperties": false
                }
              },
              "required": [
                "type",
                "payload"
              ],
              "additionalProperties": false
            },
            {
              "type": "object",
              "properties": {
                "type": {
                  "type": "string",
                  "const": "SHOW_TOAST"
                },
                "payload": {
                  "type": "object",
                  "properties": {
                    "message": {
                      "type": "string",
                      "minLength": 1
                    },
                    "variant": {
                      "type": "string",
                      "enum": [
                        "info",
                        "success",
                        "warning",
                        "error"
                      ]
                    },
                    "duration": {
                      "type": "number",
                      "exclusiveMinimum": 0
                    }
                  },
                  "required": [
                    "message",
                    "variant"
                  ],
                  "additionalProperties": false
                }
              },
              "required": [
                "type",
                "payload"
              ],
              "additionalProperties": false
            },
            {
              "type": "object",
              "properties": {
                "type": {
                  "type": "string",
                  "const": "REFRESH"
                },
                "payload": {
                  "type": "object",
                  "propertyNames": {
                    "type": "string"
                  },
                  "additionalProperties": {}
                }
              },
              "required": [
                "type"
              ],
              "additionalProperties": false
            },
            {
              "type": "object",
              "properties": {
                "type": {
                  "type": "string",
                  "const": "TOOL_CALL"
                },
                "payload": {
                  "type": "object",
                  "properties": {
                    "tool": {
                      "type": "string",
                      "minLength": 1
                    },
                    "args": {
                      "type": "object",
                      "propertyNames": {
                        "type": "string"
                      },
                      "additionalProperties": {}
                    }
                  },
                  "required": [
                    "tool",
                    "args"
                  ],
                  "additionalProperties": false
                }
              },
              "required": [
                "type",
                "payload"
              ],
              "additionalProperties": false
            },
            {
              "type": "object",
              "properties": {
                "type": {
                  "type": "string",
                  "const": "STATE_UPDATE"
                },
                "payload": {
                  "type": "object",
                  "properties": {
                    "id": {
                      "type": "string",
                      "minLength": 1
                    },
                    "state": {
                      "type": "object",
                      "propertyNames": {
                        "type": "string"
                      },
                      "additionalProperties": {}
                    }
                  },
                  "required": [
                    "id",
                    "state"
                  ],
                  "additionalProperties": false
                }
              },
              "required": [
                "type",
                "payload"
              ],
              "additionalProperties": false
            }
          ]
        },
        "aria": {
          "type": "object",
          "properties": {
            "label": {
              "type": "string"
            },
            "labelledBy": {
              "type": "string"
            },
            "describedBy": {
              "type": "string"
            },
            "hidden": {
              "type": "boolean"
            },
            "live": {
              "type": "string",
              "enum": [
                "off",
                "polite",
                "assertive"
              ]
            },
            "role": {
              "type": "string"
            }
          },
          "additionalProperties": false
        },
        "stateMachine": {
          "type": "object",
          "properties": {
            "initial": {
              "type": "string"
            },
            "states": {
              "type": "object",
              "propertyNames": {
                "type": "string"
              },
              "additionalProperties": {
                "type": "object",
                "properties": {
                  "on": {
                    "type": "object",
                    "propertyNames": {
                      "type": "string"
                    },
                    "additionalProperties": {
                      "type": "object",
                      "properties": {
                        "target": {
                          "type": "string"
                        },
                        "condition": {
                          "type": "string"
                        },
                        "action": {
                          "oneOf": [
                            {
                              "type": "object",
                              "properties": {
                                "type": {
                                  "type": "string",
                                  "const": "NAVIGATE"
                                },
                                "payload": {
                                  "type": "object",
                                  "properties": {
                                    "path": {
                                      "type": "string",
                                      "minLength": 1
                                    },
                                    "params": {
                                      "type": "object",
                                      "propertyNames": {
                                        "type": "string"
                                      },
                                      "additionalProperties": {}
                                    }
                                  },
                                  "required": [
                                    "path"
                                  ],
                                  "additionalProperties": false
                                }
                              },
                              "required": [
                                "type",
                                "payload"
                              ],
                              "additionalProperties": false
                            },
                            {
                              "type": "object",
                              "properties": {
                                "type": {
                                  "type": "string",
                                  "const": "SHOW_TOAST"
                                },
                                "payload": {
                                  "type": "object",
                                  "properties": {
                                    "message": {
                                      "type": "string",
                                      "minLength": 1
                                    },
                                    "variant": {
                                      "type": "string",
                                      "enum": [
                                        "info",
                                        "success",
                                        "warning",
                                        "error"
                                      ]
                                    },
                                    "duration": {
                                      "type": "number",
                                      "exclusiveMinimum": 0
                                    }
                                  },
                                  "required": [
                                    "message",
                                    "variant"
                                  ],
                                  "additionalProperties": false
                                }
                              },
                              "required": [
                                "type",
                                "payload"
                              ],
                              "additionalProperties": false
                            },
                            {
                              "type": "object",
                              "properties": {
                                "type": {
                                  "type": "string",
                                  "const": "REFRESH"
                                },
                                "payload": {
                                  "type": "object",
                                  "propertyNames": {
                                    "type": "string"
                                  },
                                  "additionalProperties": {}
                                }
                              },
                              "required": [
                                "type"
                              ],
                              "additionalProperties": false
                            },
                            {
                              "type": "object",
                              "properties": {
                                "type": {
                                  "type": "string",
                                  "const": "TOOL_CALL"
                                },
                                "payload": {
                                  "type": "object",
                                  "properties": {
                                    "tool": {
                                      "type": "string",
                                      "minLength": 1
                                    },
                                    "args": {
                                      "type": "object",
                                      "propertyNames": {
                                        "type": "string"
                                      },
                                      "additionalProperties": {}
                                    }
                                  },
                                  "required": [
                                    "tool",
                                    "args"
                                  ],
                                  "additionalProperties": false
                                }
                              },
                              "required": [
                                "type",
                                "payload"
                              ],
                              "additionalProperties": false
                            },
                            {
                              "type": "object",
                              "properties": {
                                "type": {
                                  "type": "string",
                                  "const": "STATE_UPDATE"
                                },
                                "payload": {
                                  "type": "object",
                                  "properties": {
                                    "id": {
                                      "type": "string",
                                      "minLength": 1
                                    },
                                    "state": {
                                      "type": "object",
                                      "propertyNames": {
                                        "type": "string"
                                      },
                                      "additionalProperties": {}
                                    }
                                  },
                                  "required": [
                                    "id",
                                    "state"
                                  ],
                                  "additionalProperties": false
                                }
                              },
                              "required": [
                                "type",
                                "payload"
                              ],
                              "additionalProperties": false
                            }
                          ]
                        }
                      },
                      "required": [
                        "target"
                      ],
                      "additionalProperties": false
                    }
                  },
                  "entry": {
                    "oneOf": [
                      {
                        "type": "object",
                        "properties": {
                          "type": {
                            "type": "string",
                            "const": "NAVIGATE"
                          },
                          "payload": {
                            "type": "object",
                            "properties": {
                              "path": {
                                "type": "string",
                                "minLength": 1
                              },
                              "params": {
                                "type": "object",
                                "propertyNames": {
                                  "type": "string"
                                },
                                "additionalProperties": {}
                              }
                            },
                            "required": [
                              "path"
                            ],
                            "additionalProperties": false
                          }
                        },
                        "required": [
                          "type",
                          "payload"
                        ],
                        "additionalProperties": false
                      },
                      {
                        "type": "object",
                        "properties": {
                          "type": {
                            "type": "string",
                            "const": "SHOW_TOAST"
                          },
                          "payload": {
                            "type": "object",
                            "properties": {
                              "message": {
                                "type": "string",
                                "minLength": 1
                              },
                              "variant": {
                                "type": "string",
                                "enum": [
                                  "info",
                                  "success",
                                  "warning",
                                  "error"
                                ]
                              },
                              "duration": {
                                "type": "number",
                                "exclusiveMinimum": 0
                              }
                            },
                            "required": [
                              "message",
                              "variant"
                            ],
                            "additionalProperties": false
                          }
                        },
                        "required": [
                          "type",
                          "payload"
                        ],
                        "additionalProperties": false
                      },
                      {
                        "type": "object",
                        "properties": {
                          "type": {
                            "type": "string",
                            "const": "REFRESH"
                          },
                          "payload": {
                            "type": "object",
                            "propertyNames": {
                              "type": "string"
                            },
                            "additionalProperties": {}
                          }
                        },
                        "required": [
                          "type"
                        ],
                        "additionalProperties": false
                      },
                      {
                        "type": "object",
                        "properties": {
                          "type": {
                            "type": "string",
                            "const": "TOOL_CALL"
                          },
                          "payload": {
                            "type": "object",
                            "properties": {
                              "tool": {
                                "type": "string",
                                "minLength": 1
                              },
                              "args": {
                                "type": "object",
                                "propertyNames": {
                                  "type": "string"
                                },
                                "additionalProperties": {}
                              }
                            },
                            "required": [
                              "tool",
                              "args"
                            ],
                            "additionalProperties": false
                          }
                        },
                        "required": [
                          "type",
                          "payload"
                        ],
                        "additionalProperties": false
                      },
                      {
                        "type": "object",
                        "properties": {
                          "type": {
                            "type": "string",
                            "const": "STATE_UPDATE"
                          },
                          "payload": {
                            "type": "object",
                            "properties": {
                              "id": {
                                "type": "string",
                                "minLength": 1
                              },
                              "state": {
                                "type": "object",
                                "propertyNames": {
                                  "type": "string"
                                },
                                "additionalProperties": {}
                              }
                            },
                            "required": [
                              "id",
                              "state"
                            ],
                            "additionalProperties": false
                          }
                        },
                        "required": [
                          "type",
                          "payload"
                        ],
                        "additionalProperties": false
                      }
                    ]
                  },
                  "exit": {
                    "oneOf": [
                      {
                        "type": "object",
                        "properties": {
                          "type": {
                            "type": "string",
                            "const": "NAVIGATE"
                          },
                          "payload": {
                            "type": "object",
                            "properties": {
                              "path": {
                                "type": "string",
                                "minLength": 1
                              },
                              "params": {
                                "type": "object",
                                "propertyNames": {
                                  "type": "string"
                                },
                                "additionalProperties": {}
                              }
                            },
                            "required": [
                              "path"
                            ],
                            "additionalProperties": false
                          }
                        },
                        "required": [
                          "type",
                          "payload"
                        ],
                        "additionalProperties": false
                      },
                      {
                        "type": "object",
                        "properties": {
                          "type": {
                            "type": "string",
                            "const": "SHOW_TOAST"
                          },
                          "payload": {
                            "type": "object",
                            "properties": {
                              "message": {
                                "type": "string",
                                "minLength": 1
                              },
                              "variant": {
                                "type": "string",
                                "enum": [
                                  "info",
                                  "success",
                                  "warning",
                                  "error"
                                ]
                              },
                              "duration": {
                                "type": "number",
                                "exclusiveMinimum": 0
                              }
                            },
                            "required": [
                              "message",
                              "variant"
                            ],
                            "additionalProperties": false
                          }
                        },
                        "required": [
                          "type",
                          "payload"
                        ],
                        "additionalProperties": false
                      },
                      {
                        "type": "object",
                        "properties": {
                          "type": {
                            "type": "string",
                            "const": "REFRESH"
                          },
                          "payload": {
                            "type": "object",
                            "propertyNames": {
                              "type": "string"
                            },
                            "additionalProperties": {}
                          }
                        },
                        "required": [
                          "type"
                        ],
                        "additionalProperties": false
                      },
                      {
                        "type": "object",
                        "properties": {
                          "type": {
                            "type": "string",
                            "const": "TOOL_CALL"
                          },
                          "payload": {
                            "type": "object",
                            "properties": {
                              "tool": {
                                "type": "string",
                                "minLength": 1
                              },
                              "args": {
                                "type": "object",
                                "propertyNames": {
                                  "type": "string"
                                },
                                "additionalProperties": {}
                              }
                            },
                            "required": [
                              "tool",
                              "args"
                            ],
                            "additionalProperties": false
                          }
                        },
                        "required": [
                          "type",
                          "payload"
                        ],
                        "additionalProperties": false
                      },
                      {
                        "type": "object",
                        "properties": {
                          "type": {
                            "type": "string",
                            "const": "STATE_UPDATE"
                          },
                          "payload": {
                            "type": "object",
                            "properties": {
                              "id": {
                                "type": "string",
                                "minLength": 1
                              },
                              "state": {
                                "type": "object",
                                "propertyNames": {
                                  "type": "string"
                                },
                                "additionalProperties": {}
                              }
                            },
                            "required": [
                              "id",
                              "state"
                            ],
                            "additionalProperties": false
                          }
                        },
                        "required": [
                          "type",
                          "payload"
                        ],
                        "additionalProperties": false
                      }
                    ]
                  },
                  "render": {
                    "description": "State-specific component override",
                    "$ref": "#/$defs/__schema0"
                  }
                },
                "additionalProperties": false
              }
            },
            "context": {
              "type": "object",
              "propertyNames": {
                "type": "string"
              },
              "additionalProperties": {}
            }
          },
          "required": [
            "initial",
            "states"
          ],
          "additionalProperties": false
        }
      },
      "required": [
        "type",
        "aria"
      ],
      "additionalProperties": false
    }
  }
}
```
