import type { ICredentialType, INodeProperties } from "n8n-workflow";

export class AckPostApi implements ICredentialType {
  name = "ackPostApi";
  displayName = "AckPost API";
  documentationUrl = "https://ackpost.com/docs/mcp";

  properties: INodeProperties[] = [
    {
      displayName: "API Key",
      name: "apiKey",
      type: "string",
      typeOptions: { password: true },
      default: "",
      required: true,
      description: "Create this in AckPost under Settings > Developer.",
    },
    {
      displayName: "Base URL",
      name: "baseUrl",
      type: "string",
      default: "https://ackpost.com",
      required: true,
      description: "Use https://ackpost.com unless you are testing a private AckPost deployment.",
    },
  ];
}
