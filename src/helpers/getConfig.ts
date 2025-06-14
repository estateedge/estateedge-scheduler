import * as dotenv from 'dotenv'
import { AppConfig } from './getConfig.types'

export const getConfig = (): AppConfig => {
  dotenv.config({ path: '../.env' })
  const { AWS_ACCOUNT_ID, AWS_REGION } = process.env

  if (!AWS_ACCOUNT_ID) {
    throw new Error('AWS_ACCOUNT_ID is not specified')
  }

  if (!AWS_REGION) {
    throw new Error('AWS_REGION is not specified')
  }

  return {
    awsAccountId: AWS_ACCOUNT_ID,
    awsRegion: AWS_REGION,
  }
}
