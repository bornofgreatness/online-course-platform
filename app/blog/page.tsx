import Header from '../../components/Header'
import BlogView from '../../components/views/BlogView'

export const metadata = {
  title: 'Blog',
  description: 'Study tips, career advice, and platform news.',
}

export default function BlogPage() {
  return (
    <>
      <Header />
      <BlogView />
    </>
  )
}
