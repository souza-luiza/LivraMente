export default function RegisterSuccessPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md text-center">
        <h1 className="text-2xl font-bold mb-4">Cadastro concluído!</h1>
        <p className="mb-6">Obrigada por se registrar. Você pode agora fazer login na sua conta.</p>
        <a
          href="/login"
          className="inline-block bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 transition"
        >
          Ir para Login
        </a>
      </div>
    </div>
  )
}