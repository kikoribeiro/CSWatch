import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { DOMParser, XMLSerializer } from 'xmldom';

export async function POST(request) {
  try {
    // Ler o corpo da requisição SOAP
    const soapEnvelope = await request.text();

    // Criar um parser XML
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(soapEnvelope, 'text/xml');

    // Extrair parâmetros da requisição SOAP
    // Função auxiliar para extrair valor de um elemento XML
    function getElementValue(xmlDocument, elementName) {
      const element = xmlDocument.getElementsByTagName(elementName)[0];
      return element ? element.textContent : null;
    }

    // Valores dos filtros
    const name = getElementValue(xmlDoc, 'name');
    const rarity = getElementValue(xmlDoc, 'rarity');
    const team = getElementValue(xmlDoc, 'team');

    // Leitura de arquivo JSON dos agentes (como já existe na sua API REST)
    const filePath = path.join(process.cwd(), 'hooks', 'agents.json');

    if (!fs.existsSync(filePath)) {
      return createSoapErrorResponse('Agents data file not found');
    }

    const fileContents = fs.readFileSync(filePath, 'utf8');
    let agents;

    try {
      agents = JSON.parse(fileContents);
      if (!Array.isArray(agents)) {
        return createSoapErrorResponse('Invalid agents data format');
      }
    } catch (parseError) {
      return createSoapErrorResponse('Invalid JSON in agents data file');
    }

    // Filtragem dos agentes baseada nos parâmetros
    if (name) {
      agents = agents.filter(
        (agent) => agent.name && agent.name.toLowerCase().includes(name.toLowerCase())
      );
    }

    if (rarity && rarity !== 'all') {
      agents = agents.filter(
        (agent) =>
          agent.rarity &&
          agent.rarity.name &&
          agent.rarity.name.toLowerCase() === rarity.toLowerCase()
      );
    }

    if (team && team !== 'all') {
      agents = agents.filter(
        (agent) =>
          agent.team && agent.team.name && agent.team.name.toLowerCase() === team.toLowerCase()
      );
    }

    // Criar resposta SOAP
    const agentsXML = agents
      .map(
        (agent) => `
      <tns:agent>
        <tns:id>${escapeXML(agent.id || '')}</tns:id>
        <tns:name>${escapeXML(agent.name || '')}</tns:name>
        <tns:image>${escapeXML(agent.image || '')}</tns:image>
        <tns:rarity>
          <tns:name>${escapeXML(agent.rarity?.name || '')}</tns:name>
          <tns:color>${escapeXML(agent.rarity?.color || '')}</tns:color>
        </tns:rarity>
        <tns:team>
          <tns:name>${escapeXML(agent.team?.name || '')}</tns:name>
        </tns:team>
      </tns:agent>
    `
      )
      .join('');

    const soapResponse = `
      <soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
        <soap:Body>
          <tns:AgentResponse xmlns:tns="http://cswatch.com/agents">
            <tns:agents>
              ${agentsXML}
            </tns:agents>
          </tns:AgentResponse>
        </soap:Body>
      </soap:Envelope>
    `;

    return new NextResponse(soapResponse, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
      },
    });
  } catch (error) {
    console.error('Error in SOAP agents service:', error);
    return createSoapErrorResponse('Internal Server Error');
  }
}

function createSoapErrorResponse(message) {
  return new NextResponse(
    `<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
      <soap:Body>
        <soap:Fault>
          <faultcode>soap:Server</faultcode>
          <faultstring>${escapeXML(message)}</faultstring>
        </soap:Fault>
      </soap:Body>
    </soap:Envelope>`,
    {
      status: 500,
      headers: {
        'Content-Type': 'application/xml',
      },
    }
  );
}

function escapeXML(text) {
  if (typeof text !== 'string') return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
