#!/usr/bin/env node

/**
 * Documentation Validation Script
 * 
 * This script validates that all fundamental documentation meets the requirements
 * specified in the project-documentation spec.
 * 
 * Usage: node docs/validate-docs.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

// Validation results
const results = {
  passed: [],
  failed: [],
  warnings: []
};

// Helper functions
function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function pass(message) {
  results.passed.push(message);
  log(`✓ ${message}`, 'green');
}

function fail(message) {
  results.failed.push(message);
  log(`✗ ${message}`, 'red');
}

function warn(message) {
  results.warnings.push(message);
  log(`⚠ ${message}`, 'yellow');
}

function readFile(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    return null;
  }
}

function fileExists(filePath) {
  return fs.existsSync(filePath);
}

function containsAll(content, terms) {
  return terms.every(term => content.includes(term));
}

function containsAny(content, terms) {
  return terms.some(term => content.includes(term));
}

function countOccurrences(content, term) {
  const regex = new RegExp(term, 'gi');
  const matches = content.match(regex);
  return matches ? matches.length : 0;
}

// Validation functions

function validateFileExists(filePath, description) {
  log(`\nValidating: ${description}`, 'cyan');
  if (fileExists(filePath)) {
    pass(`File exists: ${filePath}`);
    return true;
  } else {
    fail(`File missing: ${filePath}`);
    return false;
  }
}

function validateArchitectureOverview() {
  log('\n=== Validating Architecture Overview ===', 'blue');
  const filePath = 'docs/architecture/overview.md';
  
  if (!validateFileExists(filePath, 'Architecture Overview')) return;
  
  const content = readFile(filePath);
  
  // Requirement 1.1: Stack tecnológica completa
  const stackTech = ['Node.js', 'Express', 'Groq SDK', 'Firebase Firestore', 'HTML', 'CSS', 'JavaScript'];
  if (containsAll(content, stackTech)) {
    pass('Contains complete technology stack');
  } else {
    fail('Missing some technology stack components');
  }
  
  // Requirement 1.2: Componentes principais
  const components = ['Backend', 'Frontend', 'IA', 'Banco de Dados'];
  if (containsAll(content, components)) {
    pass('Documents all main components');
  } else {
    fail('Missing some main components');
  }
  
  // Requirement 1.3: Padrão arquitetural
  if (content.includes('API REST')) {
    pass('Explains architectural pattern (API REST)');
  } else {
    fail('Missing architectural pattern explanation');
  }
  
  // Requirement 1.4: Diagrama visual
  if (content.includes('```mermaid')) {
    pass('Includes visual architecture diagram');
  } else {
    fail('Missing visual architecture diagram');
  }
  
  // Requirement 1.5: Responsabilidades
  if (content.includes('Responsabilidades') || content.includes('Responsabilidade')) {
    pass('Describes layer responsibilities');
  } else {
    fail('Missing layer responsibilities description');
  }
}

function validateDataFlow() {
  log('\n=== Validating Data Flow ===', 'blue');
  const filePath = 'docs/architecture/data-flow.md';
  
  if (!validateFileExists(filePath, 'Data Flow')) return;
  
  const content = readFile(filePath);
  
  // Requirement 2.1: Fluxo completo
  if (content.includes('upload') && content.includes('visualização')) {
    pass('Illustrates complete flow from upload to visualization');
  } else {
    fail('Missing complete flow illustration');
  }
  
  // Requirement 2.2: Integração Groq API
  if (content.includes('Groq API') && content.includes('LLM')) {
    pass('Shows Groq API integration');
  } else {
    fail('Missing Groq API integration documentation');
  }
  
  // Requirement 2.3: Armazenamento Firestore
  if (content.includes('Firestore') && content.includes('armazenamento')) {
    pass('Documents Firestore storage process');
  } else {
    fail('Missing Firestore storage documentation');
  }
  
  // Requirement 2.4: Transformações de dados
  const transformations = ['imagem', 'base64', 'JSON', 'Firestore'];
  if (containsAll(content, transformations)) {
    pass('Includes data transformation points');
  } else {
    fail('Missing data transformation documentation');
  }
  
  // Requirement 2.5: Diagramas de sequência
  const mermaidCount = countOccurrences(content, '```mermaid');
  if (mermaidCount >= 3) {
    pass(`Includes ${mermaidCount} Mermaid diagrams`);
  } else {
    warn(`Only ${mermaidCount} Mermaid diagrams found (expected at least 3)`);
  }
}

function validateDatabaseSchema() {
  log('\n=== Validating Database Schema ===', 'blue');
  const filePath = 'docs/database/schema.md';
  
  if (!validateFileExists(filePath, 'Database Schema')) return;
  
  const content = readFile(filePath);
  
  // Requirement 3.1: Collection matches
  if (content.includes('matches') && content.includes('campos')) {
    pass('Documents matches collection with fields');
  } else {
    fail('Missing matches collection documentation');
  }
  
  // Requirement 3.2: Collection counters
  if (content.includes('counters') && content.includes('ID incremental')) {
    pass('Documents counters collection and incremental ID system');
  } else {
    fail('Missing counters collection documentation');
  }
  
  // Requirement 3.3: Campos obrigatórios
  if (content.includes('Obrigatório') || content.includes('obrigatório')) {
    pass('Specifies required vs optional fields');
  } else {
    fail('Missing required/optional field specification');
  }
  
  // Requirement 3.4: Exemplos JSON
  const jsonExamples = countOccurrences(content, '```json');
  if (jsonExamples >= 2) {
    pass(`Includes ${jsonExamples} JSON document examples`);
  } else {
    warn(`Only ${jsonExamples} JSON examples found (expected at least 2)`);
  }
  
  // Requirement 3.5: Índices
  if (content.includes('índice') || content.includes('orderBy')) {
    pass('Documents indexes for sorting');
  } else {
    fail('Missing index documentation');
  }
  
  // Requirement 3.6: Lista de estatísticas
  const stats = ['chutes', 'posse', 'passes'];
  if (containsAll(content, stats)) {
    pass('Lists all extracted statistics');
  } else {
    fail('Missing complete statistics list');
  }
}

function validateAPIEndpoints() {
  log('\n=== Validating API Endpoints ===', 'blue');
  const filePath = 'docs/api/endpoints.md';
  
  if (!validateFileExists(filePath, 'API Endpoints')) return;
  
  const content = readFile(filePath);
  
  // Requirement 4.1: POST /api/upload
  if (content.includes('POST /api/upload') && content.includes('parâmetros')) {
    pass('Documents POST /api/upload endpoint');
  } else {
    fail('Missing POST /api/upload documentation');
  }
  
  // Requirement 4.2: GET /api/matches
  if (content.includes('GET /api/matches')) {
    pass('Documents GET /api/matches endpoint');
  } else {
    fail('Missing GET /api/matches documentation');
  }
  
  // Requirement 4.3: DELETE /api/matches/:id
  if (content.includes('DELETE /api/matches/:id')) {
    pass('Documents DELETE /api/matches/:id endpoint');
  } else {
    fail('Missing DELETE /api/matches/:id documentation');
  }
  
  // Requirement 4.4: Exemplos de requisições
  const codeBlocks = countOccurrences(content, '```');
  if (codeBlocks >= 6) {
    pass(`Includes ${codeBlocks / 2} code examples`);
  } else {
    warn('May be missing some request/response examples');
  }
  
  // Requirement 4.5: Códigos HTTP
  const httpCodes = ['200', '400', '500'];
  if (containsAll(content, httpCodes)) {
    pass('Specifies HTTP status codes');
  } else {
    fail('Missing HTTP status code documentation');
  }
  
  // Requirement 4.6: Formatos de erro
  if (content.includes('error') && content.includes('json')) {
    pass('Documents error formats');
  } else {
    fail('Missing error format documentation');
  }
  
  // Requirement 4.7: Headers necessários
  if (content.includes('Header') || content.includes('Content-Type')) {
    pass('Specifies necessary headers');
  } else {
    fail('Missing header documentation');
  }
}

function validateDevelopmentSetup() {
  log('\n=== Validating Development Setup Guide ===', 'blue');
  const filePath = 'docs/guides/development-setup.md';
  
  if (!validateFileExists(filePath, 'Development Setup Guide')) return;
  
  const content = readFile(filePath);
  
  // Requirement 5.1: Pré-requisitos
  const prereqs = ['Node.js', '18.0.0', 'npm', 'Groq', 'Firebase'];
  if (containsAll(content, prereqs)) {
    pass('Lists all prerequisites');
  } else {
    fail('Missing some prerequisites');
  }
  
  // Requirement 5.2: Clonagem e instalação
  if (content.includes('git clone') && content.includes('npm install')) {
    pass('Documents cloning and installation process');
  } else {
    fail('Missing cloning/installation instructions');
  }
  
  // Requirement 5.3: GROQ_API_KEY
  if (content.includes('GROQ_API_KEY') && content.includes('.env')) {
    pass('Explains GROQ_API_KEY configuration');
  } else {
    fail('Missing GROQ_API_KEY configuration');
  }
  
  // Requirement 5.4: Firebase credentials
  if (content.includes('firebase-credentials.json')) {
    pass('Explains Firebase credentials configuration');
  } else {
    fail('Missing Firebase credentials configuration');
  }
  
  // Requirement 5.5: Comandos para iniciar
  if (content.includes('npm start') || content.includes('npm run')) {
    pass('Documents server start commands');
  } else {
    fail('Missing server start commands');
  }
  
  // Requirement 5.6: Verificação do ambiente
  if (content.includes('Verificação') || content.includes('Testar')) {
    pass('Includes environment verification instructions');
  } else {
    fail('Missing environment verification');
  }
  
  // Requirement 5.7: Estrutura de diretórios
  if (content.includes('Estrutura') && content.includes('diretórios')) {
    pass('Documents project directory structure');
  } else {
    fail('Missing directory structure documentation');
  }
}

function validateMainREADME() {
  log('\n=== Validating Main README ===', 'blue');
  const filePath = 'docs/README.md';
  
  if (!validateFileExists(filePath, 'Main README')) return;
  
  const content = readFile(filePath);
  
  // Check for main sections
  if (content.includes('Índice') || content.includes('índice')) {
    pass('Includes table of contents');
  } else {
    fail('Missing table of contents');
  }
  
  if (content.includes('Quick Start')) {
    pass('Includes Quick Start section');
  } else {
    fail('Missing Quick Start section');
  }
  
  // Check for links to other docs
  const docLinks = [
    'architecture/overview.md',
    'architecture/data-flow.md',
    'api/endpoints.md',
    'database/schema.md',
    'guides/development-setup.md'
  ];
  
  const missingLinks = docLinks.filter(link => !content.includes(link));
  if (missingLinks.length === 0) {
    pass('All documentation links present');
  } else {
    warn(`Missing links to: ${missingLinks.join(', ')}`);
  }
}

function validateInternalLinks() {
  log('\n=== Validating Internal Links ===', 'blue');
  
  const docs = [
    'docs/README.md',
    'docs/architecture/overview.md',
    'docs/architecture/data-flow.md',
    'docs/database/schema.md',
    'docs/api/endpoints.md',
    'docs/guides/development-setup.md'
  ];
  
  let brokenLinks = 0;
  
  docs.forEach(docPath => {
    const content = readFile(docPath);
    if (!content) return;
    
    // Extract markdown links: [text](path)
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    let match;
    
    while ((match = linkRegex.exec(content)) !== null) {
      const linkPath = match[2];
      
      // Skip external links
      if (linkPath.startsWith('http://') || linkPath.startsWith('https://')) {
        continue;
      }
      
      // Skip anchors
      if (linkPath.startsWith('#')) {
        continue;
      }
      
      // Resolve relative path
      const docDir = path.dirname(docPath);
      const fullPath = path.join(docDir, linkPath.split('#')[0]);
      
      if (!fileExists(fullPath)) {
        fail(`Broken link in ${docPath}: ${linkPath}`);
        brokenLinks++;
      }
    }
  });
  
  if (brokenLinks === 0) {
    pass('All internal links are valid');
  } else {
    fail(`Found ${brokenLinks} broken internal links`);
  }
}

function validateMermaidSyntax() {
  log('\n=== Validating Mermaid Diagrams ===', 'blue');
  
  const docs = [
    'docs/architecture/overview.md',
    'docs/architecture/data-flow.md'
  ];
  
  let diagramCount = 0;
  let invalidDiagrams = 0;
  
  docs.forEach(docPath => {
    const content = readFile(docPath);
    if (!content) return;
    
    // Extract mermaid blocks
    const mermaidRegex = /```mermaid\n([\s\S]*?)```/g;
    let match;
    
    while ((match = mermaidRegex.exec(content)) !== null) {
      diagramCount++;
      const diagram = match[1];
      
      // Basic syntax validation
      const validTypes = ['graph', 'sequenceDiagram', 'classDiagram', 'stateDiagram', 'erDiagram'];
      const hasValidType = validTypes.some(type => diagram.trim().startsWith(type));
      
      if (!hasValidType) {
        warn(`Potentially invalid Mermaid diagram in ${docPath}`);
        invalidDiagrams++;
      }
    }
  });
  
  if (diagramCount > 0) {
    pass(`Found ${diagramCount} Mermaid diagrams`);
  } else {
    fail('No Mermaid diagrams found');
  }
  
  if (invalidDiagrams === 0) {
    pass('All Mermaid diagrams have valid syntax');
  } else {
    warn(`${invalidDiagrams} diagrams may have syntax issues`);
  }
}

function validateCodeExamples() {
  log('\n=== Validating Code Examples ===', 'blue');
  
  const docs = [
    'docs/api/endpoints.md',
    'docs/guides/development-setup.md'
  ];
  
  let totalExamples = 0;
  let examplesWithLanguage = 0;
  
  docs.forEach(docPath => {
    const content = readFile(docPath);
    if (!content) return;
    
    // Count code blocks with language
    const codeBlockRegex = /```(\w+)\n/g;
    let match;
    
    while ((match = codeBlockRegex.exec(content)) !== null) {
      totalExamples++;
      if (match[1] && match[1] !== '') {
        examplesWithLanguage++;
      }
    }
  });
  
  if (totalExamples > 0) {
    pass(`Found ${totalExamples} code examples`);
  } else {
    warn('No code examples found');
  }
  
  if (examplesWithLanguage === totalExamples) {
    pass('All code blocks have language specified');
  } else {
    warn(`${totalExamples - examplesWithLanguage} code blocks missing language specification`);
  }
}

// Main validation function
function runValidation() {
  log('\n╔════════════════════════════════════════════════════════╗', 'cyan');
  log('║   Documentation Validation - JHD Managers Project    ║', 'cyan');
  log('╚════════════════════════════════════════════════════════╝', 'cyan');
  
  // Run all validations
  validateMainREADME();
  validateArchitectureOverview();
  validateDataFlow();
  validateDatabaseSchema();
  validateAPIEndpoints();
  validateDevelopmentSetup();
  validateInternalLinks();
  validateMermaidSyntax();
  validateCodeExamples();
  
  // Print summary
  log('\n╔════════════════════════════════════════════════════════╗', 'cyan');
  log('║                   Validation Summary                  ║', 'cyan');
  log('╚════════════════════════════════════════════════════════╝', 'cyan');
  
  log(`\n✓ Passed: ${results.passed.length}`, 'green');
  log(`✗ Failed: ${results.failed.length}`, 'red');
  log(`⚠ Warnings: ${results.warnings.length}`, 'yellow');
  
  if (results.failed.length === 0) {
    log('\n🎉 All validations passed!', 'green');
    log('The fundamental documentation is complete and meets all requirements.', 'green');
    return 0;
  } else {
    log('\n❌ Some validations failed.', 'red');
    log('Please review the failed checks above and update the documentation.', 'red');
    return 1;
  }
}

// Run validation
const exitCode = runValidation();
process.exit(exitCode);
