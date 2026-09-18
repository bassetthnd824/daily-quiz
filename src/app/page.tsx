import { getSession } from '@/util/require-session'
import HomePage from './HomePage'

const HomeComponent = async () => {
  const session = await getSession()
  return <HomePage signedIn={session.ok} />
}

export default HomeComponent
