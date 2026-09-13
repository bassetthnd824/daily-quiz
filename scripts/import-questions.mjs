import { readFileSync, existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { applicationDefault, cert, initializeApp } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const QUESTIONS_PATH = join(ROOT, 'data', 'questions.json')
const SERVICE_ACCOUNT_PATH = join(ROOT, 'src', 'firebase', 'serviceAccount.json')
const COLLECTION = 'questions'
const BATCH_LIMIT = 400

const NEVER_USED_DATE = '1111-11-11'
const ACTIVE_STATUS = 'A'

const args = new Set(process.argv.slice(2))
const dryRun = args.has('--dry-run')
const useEmulator = args.has('--emulator')

const fail = (message) => {
  console.error(message)
  process.exit(1)
}

const loadQuestions = () => {
  if (!existsSync(QUESTIONS_PATH)) {
    fail(`Missing ${QUESTIONS_PATH}`)
  }

  const parsed = JSON.parse(readFileSync(QUESTIONS_PATH, 'utf8'))
  if (!Array.isArray(parsed) || parsed.length === 0) {
    fail('questions.json must be a non-empty array of Firestore documents')
  }

  const texts = new Set()
  parsed.forEach((question, index) => {
    if (!question || typeof question !== 'object') {
      fail(`Question at index ${index} is not an object`)
    }

    const { text, answers, lastUsedDate, status, submittedBy, dateSubmitted } = question
    if (typeof text !== 'string' || text.trim().length === 0) {
      fail(`Question at index ${index} is missing text`)
    }
    if (texts.has(text)) {
      fail(`Duplicate question text at index ${index}: ${text}`)
    }
    texts.add(text)

    if (!Array.isArray(answers) || answers.length < 4) {
      fail(`Question at index ${index} needs at least 4 answers (correct first)`)
    }
    if (answers.some((answer) => typeof answer !== 'string' || answer.trim().length === 0)) {
      fail(`Question at index ${index} has a blank answer`)
    }
    if (new Set(answers).size !== answers.length) {
      fail(`Question at index ${index} has duplicate answers`)
    }
    if (lastUsedDate !== NEVER_USED_DATE) {
      fail(`Question at index ${index} lastUsedDate must be ${NEVER_USED_DATE}`)
    }
    if (status !== ACTIVE_STATUS) {
      fail(`Question at index ${index} status must be ${ACTIVE_STATUS}`)
    }
    if (typeof submittedBy !== 'string' || submittedBy.trim().length === 0) {
      fail(`Question at index ${index} is missing submittedBy`)
    }
    if (typeof dateSubmitted !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(dateSubmitted)) {
      fail(`Question at index ${index} dateSubmitted must be YYYY-MM-DD`)
    }
  })

  return parsed
}

const loadServiceAccount = () => {
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    return JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
  }
  if (existsSync(SERVICE_ACCOUNT_PATH)) {
    return JSON.parse(readFileSync(SERVICE_ACCOUNT_PATH, 'utf8'))
  }
  return undefined
}

const initFirestore = () => {
  if (useEmulator && !process.env.FIRESTORE_EMULATOR_HOST) {
    process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080'
  }

  const projectId =
    process.env.GCLOUD_PROJECT ||
    process.env.GOOGLE_CLOUD_PROJECT ||
    process.env.FIREBASE_PROJECT_ID ||
    'daily-quiz-464300'

  if (process.env.FIRESTORE_EMULATOR_HOST) {
    initializeApp({ projectId })
    return getFirestore()
  }

  const serviceAccount = loadServiceAccount()
  if (serviceAccount) {
    initializeApp({ credential: cert(serviceAccount), projectId: serviceAccount.project_id || projectId })
    return getFirestore()
  }

  initializeApp({ credential: applicationDefault(), projectId })
  return getFirestore()
}

const questions = loadQuestions()

if (dryRun) {
  console.log(`Validated ${questions.length} questions at ${QUESTIONS_PATH}`)
  process.exit(0)
}

const db = initFirestore()
const collection = db.collection(COLLECTION)

for (let offset = 0; offset < questions.length; offset += BATCH_LIMIT) {
  const batch = db.batch()
  const chunk = questions.slice(offset, offset + BATCH_LIMIT)
  for (const question of chunk) {
    batch.set(collection.doc(), question)
  }
  await batch.commit()
  console.log(`Wrote ${Math.min(offset + chunk.length, questions.length)} / ${questions.length}`)
}

console.log(`Imported ${questions.length} questions into the "${COLLECTION}" collection`)
