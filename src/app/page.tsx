import { getSession } from '@/util/require-session'
import HomePage from './HomePage'

const HomeComponent = async () => {
  const session = await getSession()
  return <HomePage initiallySignedIn={session.ok} />
}

export default HomeComponent
