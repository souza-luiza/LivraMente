import LoadingComponent from './portable-loading'

export default function LoadingPage() {
  return (
    <div data-testid="loading-main" className="flex items-center justify-center h-screen w-screen bg-white">
      <LoadingComponent size="large" />
    </div>
  )
}