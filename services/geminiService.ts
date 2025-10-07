import { GoogleGenAI } from "@google/genai";
import { HRRecord, Collaborator } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getAIAssistantResponse = async (question: string, records: HRRecord[], collaborators: Collaborator[]): Promise<string> => {
  try {
    const systemInstruction = `Eres un analista experto en datos de Recursos Humanos. Tu tarea es responder preguntas basándote en dos conjuntos de datos JSON que te proporcionaré.

    1.  **COLABORADORES**: Una lista de todos los empleados de la empresa. Cada uno tiene un 'id' único y campos como nombre, dni, legajo, cuil, puesto, estado ('Activo' o 'Inactivo'), etc.
    2.  **REGISTROS**: Una lista de eventos de RRHH (INGRESO, EGRESO, SANCION, AUSENCIA). Cada registro está vinculado a un empleado a través del campo 'collaboratorId', que corresponde al 'id' de la lista de COLABORADORES.

    Responde la pregunta del usuario basándote ÚNICAMENTE en los datos proporcionados.
    Cruza la información de ambas listas para dar respuestas completas. Por ejemplo, si te preguntan por un nombre, busca su 'id' en COLABORADORES y luego encuentra todos sus eventos en REGISTROS.
    Proporciona respuestas claras, concisas y profesionales en español. No inventes información.
    Cuando te refieras a dinero, formatéalo como una moneda (por ejemplo, $1,234.56).`;
    
    const collaboratorsString = JSON.stringify(collaborators, null, 2);
    const recordsString = JSON.stringify(records, null, 2);

    const contents = `CONTEXTO DE DATOS:\n\n### COLABORADORES ###\n${collaboratorsString}\n\n### REGISTROS ###\n${recordsString}\n\nPREGUNTA DEL USUARIO:\n${question}`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: contents,
        config: {
            systemInstruction: systemInstruction,
            temperature: 0.2,
            topP: 0.9,
            topK: 32,
        }
    });
    
    return response.text;
  } catch (error) {
    console.error("Error al llamar a la API de Gemini:", error);
    return "Lo siento, encontré un error al analizar los datos. Por favor, inténtalo de nuevo.";
  }
};