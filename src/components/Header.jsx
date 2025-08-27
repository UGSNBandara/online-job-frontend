import { Link } from 'react-router-dom'
import AuthButton from './AuthButton'

function Header() {
  return (
    <header className="header">
      <Link to="/" className="site-name">JobConnect</Link>
      <AuthButton />
    </header>
  )
}

export default Header 