import type {
  IDataObject,
  IExecuteFunctions,
  INodeExecutionData,
  NodeConnectionType,
  INodeType,
  INodeTypeDescription,
} from "n8n-workflow";
import { NodeOperationError } from "n8n-workflow";

type AckPostCredentials = {
  apiKey: string;
  baseUrl: string;
};

async function callAckPostTool(
  context: IExecuteFunctions,
  credentials: AckPostCredentials,
  toolName: string,
  args: IDataObject,
  itemIndex: number,
) {
  const baseUrl = credentials.baseUrl.replace(/\/+$/, "");
  const response = await context.helpers.httpRequest({
    method: "POST",
    url: `${baseUrl}/api/ackpost/mcp`,
    headers: {
      Authorization: `Bearer ${credentials.apiKey}`,
      "Content-Type": "application/json",
    },
    body: {
      jsonrpc: "2.0",
      id: `${Date.now()}-${itemIndex}`,
      method: "tools/call",
      params: {
        name: toolName,
        arguments: args,
      },
    },
    json: true,
  });

  if (response?.error) {
    throw new NodeOperationError(context.getNode(), response.error.message || "AckPost MCP request failed", { itemIndex });
  }

  const content = response?.result?.content;
  const textBlock = Array.isArray(content) ? content.find((entry) => entry?.type === "text") : undefined;

  if (typeof textBlock?.text === "string") {
    try {
      return JSON.parse(textBlock.text);
    } catch {
      return { text: textBlock.text };
    }
  }

  return response?.result ?? response;
}

export class AckPost implements INodeType {
  description: INodeTypeDescription = {
    displayName: "AckPost",
    name: "ackPost",
    icon: "file:ackpost.svg",
    group: ["output"],
    version: 1,
    subtitle: '={{$parameter["operation"]}}',
    description: "Create AckPost drafts and inspect approval-safe publishing data.",
    defaults: {
      name: "AckPost",
    },
    inputs: ["main" as NodeConnectionType],
    outputs: ["main" as NodeConnectionType],
    credentials: [
      {
        name: "ackPostApi",
        required: true,
      },
    ],
    properties: [
      {
        displayName: "Operation",
        name: "operation",
        type: "options",
        noDataExpression: true,
        default: "listBrands",
        options: [
          {
            name: "Create Draft",
            value: "createDraft",
            description: "Create a draft in AckPost for human review",
            action: "Create a draft",
          },
          {
            name: "List Brands",
            value: "listBrands",
            description: "List brands available to the API key",
            action: "List brands",
          },
          {
            name: "List Proofs",
            value: "listProofs",
            description: "List publish proof records",
            action: "List proofs",
          },
          {
            name: "List Queue Items",
            value: "listQueue",
            description: "List scheduled, active, completed, and failed queue items",
            action: "List queue items",
          },
        ],
      },
      {
        displayName: "Brand ID",
        name: "brandId",
        type: "string",
        default: "",
        required: true,
        displayOptions: {
          show: {
            operation: ["createDraft"],
          },
        },
        description: "AckPost brand ID that should receive the draft.",
      },
      {
        displayName: "Content",
        name: "content",
        type: "string",
        typeOptions: {
          rows: 5,
        },
        default: "",
        required: true,
        displayOptions: {
          show: {
            operation: ["createDraft"],
          },
        },
        description: "Draft post content. The workflow creates a draft only; publishing still happens inside AckPost.",
      },
      {
        displayName: "Platform",
        name: "platform",
        type: "options",
        default: "facebook",
        displayOptions: {
          show: {
            operation: ["createDraft"],
          },
        },
        options: [
          { name: "Facebook", value: "facebook" },
          { name: "Instagram", value: "instagram" },
          { name: "LinkedIn", value: "linkedin" },
          { name: "Pinterest", value: "pinterest" },
          { name: "WordPress", value: "wordpress" },
          { name: "X", value: "x" },
          { name: "YouTube", value: "youtube" },
        ],
      },
      {
        displayName: "Campaign Source",
        name: "source",
        type: "string",
        default: "n8n",
        displayOptions: {
          show: {
            operation: ["createDraft"],
          },
        },
        description: "Attribution label stored with the draft metadata when supported.",
      },
      {
        displayName: "Limit",
        name: "limit",
        type: "number",
        typeOptions: {
          minValue: 1,
          maxValue: 100,
        },
        default: 25,
        displayOptions: {
          show: {
            operation: ["listQueue", "listProofs"],
          },
        },
      },
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const returnData: INodeExecutionData[] = [];
    const credentials = (await this.getCredentials("ackPostApi")) as AckPostCredentials;

    for (let itemIndex = 0; itemIndex < items.length; itemIndex += 1) {
      const operation = this.getNodeParameter("operation", itemIndex) as string;
      let toolName = "ackpost_list_brands";
      let args: IDataObject = {};

      if (operation === "createDraft") {
        toolName = "ackpost_create_draft";
        args = {
          brandId: this.getNodeParameter("brandId", itemIndex) as string,
          content: this.getNodeParameter("content", itemIndex) as string,
          platform: this.getNodeParameter("platform", itemIndex) as string,
          source: this.getNodeParameter("source", itemIndex) as string,
        };
      }

      if (operation === "listQueue") {
        toolName = "ackpost_list_queue";
        args = { limit: this.getNodeParameter("limit", itemIndex) as number };
      }

      if (operation === "listProofs") {
        toolName = "ackpost_list_proofs";
        args = { limit: this.getNodeParameter("limit", itemIndex) as number };
      }

      const result = await callAckPostTool(this, credentials, toolName, args, itemIndex);
      const rows = Array.isArray(result) ? result : [result];

      for (const row of rows) {
        returnData.push({ json: row as IDataObject, pairedItem: { item: itemIndex } });
      }
    }

    return [returnData];
  }
}
