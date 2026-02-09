# Voice Draft (STT + Qwen) - Local Test Guide

This document describes the local test pipeline for creating invoice/quote drafts from voice input using:
- Managed STT: Google Cloud Speech-to-Text
- Local LLM: Qwen via Ollama

## What This Does

Flow:
1. Upload audio to backend endpoint
2. Backend sends audio to Google STT for transcription
3. Transcript is parsed with Qwen (Ollama) into structured JSON
4. Backend creates a draft invoice or quote

## Endpoint

POST `/api/companies/{companyId}/voice/draft`

Consumes: `multipart/form-data`

Required:
- `audio` (file)

Optional:
- `documentType` (invoice|quote)
- `languageCode` (default: en-US)
- `sampleRateHertz` (default: 16000)
- `encoding` (default: LINEAR16)

## Example Curl

```bash
curl -X POST "http://localhost:8080/api/companies/1/voice/draft" \
  -H "Authorization: Bearer <YOUR_TOKEN>" \
  -F "audio=@/absolute/path/to/audio.wav" \
  -F "documentType=invoice" \
  -F "languageCode=en-US" \
  -F "sampleRateHertz=16000" \
  -F "encoding=LINEAR16"
```

## Local Requirements

1. Backend running (dev profile)
2. MySQL available at `jdbc:mysql://localhost:3306/quickledger`
3. Google Cloud Speech-to-Text API enabled for the project used by credentials
4. Ollama running with Qwen model pulled

## Configure Google STT

Make sure the Speech-to-Text API is enabled for your GCP project, then set:

```bash
export GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json
```

## Configure Ollama (Qwen)

```bash
ollama pull qwen2.5:3b
ollama serve
```

Backend config defaults (in `application.properties`):

```
voice.llm.base-url=http://localhost:11434
voice.llm.model=qwen2.5:3b
voice.llm.timeout-ms=20000
```

## Current Validation Note

Invoice creation currently requires a client email. Voice parsing only extracts a name by default, so invoice creation may fail with:

```
Client email is mandatory
```

If you want voice drafts to save without email, we can loosen validation for draft invoices or add a confirmation step that supplies email before saving.

## Files Added (Backend)

- `src/main/java/io/quickledger/controllers/voice/VoiceDraftController.java`
- `src/main/java/io/quickledger/services/voice/VoiceDraftService.java`
- `src/main/java/io/quickledger/services/voice/VoiceParseService.java`
- `src/main/java/io/quickledger/services/voice/GoogleSpeechToTextService.java`
- `src/main/java/io/quickledger/services/voice/OllamaClient.java`
- `src/main/java/io/quickledger/services/voice/SpeechToTextService.java`
- `src/main/java/io/quickledger/dto/voice/VoiceDraftResponse.java`
- `src/main/java/io/quickledger/dto/voice/VoiceParseResult.java`
- `src/main/java/io/quickledger/dto/voice/VoiceLineItem.java`
- `src/main/java/io/quickledger/dto/voice/VoiceDocumentType.java`
- `src/main/java/io/quickledger/config/VoiceProperties.java`

## Troubleshooting

- 403 response:
  - Check `auth0.domain` in `application-dev.properties` matches your token issuer.
- 500 with STT error:
  - Enable Google Speech-to-Text API for the project in your credentials.
- 400 “Client email is mandatory”:
  - Expected until we loosen validation for draft invoices or add a confirmation step.
