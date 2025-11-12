import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LlmToolsService } from './llm.tools.service';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { AgentExecutor, createReactAgent } from 'langchain/agents'; // n ta indo aqui
import { PromptTemplate } from '@langchain/core/prompts'; 
import { HarmBlockThreshold, HarmCategory } from '@google/generative-ai';

const AGENT_PROMPT_TEMPLATE = `
Você é um assistente prestativo do site Livramente. Responda à pergunta do usuário da melhor forma que puder.

Você tem acesso às seguintes ferramentas:
{tools}

Use o seguinte formato:

Pergunta: a pergunta original que você precisa responder
Pensamento: você deve pensar sobre o que fazer
Ação: a ação a ser tomada, que DEVE ser uma das seguintes: [{tool_names}]
Input da Ação: o input para a ação (use um JSON se a ferramenta esperar argumentos)
Observação: o resultado da ação
... (este ciclo de Pensamento/Ação/Input/Observação pode se repetir N vezes)
Pensamento: Eu agora sei a resposta final
Resposta Final: a resposta final para a pergunta original do usuário

Inicie!

Pergunta: {input}
Pensamento: {agent_scratchpad}
`;

@Injectable()
export class LlmAgentService {
  private llm: ChatGoogleGenerativeAI;

  constructor(
    private configService: ConfigService,
    private toolsService: LlmToolsService,
  ) {
    this.llm = new ChatGoogleGenerativeAI({
      apiKey: this.configService.get<string>('GOOGLE_API_KEY'),
      model: 'gemini-2.5-flash',
      safetySettings: [
        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
      ],
      temperature: 0.3,
    });
  }

  // Método para executar o Agente de Análise
  public async runAnalysisAgent(
    userPrompt: string,
    userId: string,
  ): Promise<string> {

    const tools = [
      this.toolsService.createGetUserStoriesTool(userId),
      this.toolsService.createGetPopularCommunitiesTool(),
      this.toolsService.createGetRecentStoriesTool(),
    ];

    const prompt = PromptTemplate.fromTemplate(AGENT_PROMPT_TEMPLATE);

    const agent = await createReactAgent({
      llm: this.llm,
      tools,
      prompt,
    });

    const agentExecutor = new AgentExecutor({
      agent,
      tools,
      verbose: true,
    });

    try {
      const result = await agentExecutor.invoke({
        input: userPrompt,
      });

      return result.output;

    } catch (e) {
      console.error("[LlmAgentService] Erro ao executar o Agente:", e);
      return "Desculpe, ocorreu um erro ao tentar processar sua solicitação.";
    }
  }
}