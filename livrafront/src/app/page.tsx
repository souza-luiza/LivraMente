import Image from "next/image";

export default function Home() {
  return (
    <div className="w-full min-h-screen bg-gray-100 flex justify-center items-center px-4 overflow-x-hidden">
      <div
        className="flex gap-[45px]"
        style={{
          width: '1200px',
          height: '691px',
        }}
      >
        {/* Bloco do logo + textos */}
        <div
          className="flex flex-col items-center justify-center"
          style={{
            width: '590px',
          }}
        >
          <Image
            src="/logo.png"
            alt="Logo"
            width={242}
            height={225}
            priority
          />
          <h1
            className="text-center mt-0"
            style={{
              color: "#4C7235",
              fontFamily: "'Poppins', sans-serif",
              fontSize: "50px",
              fontWeight: 600,
              lineHeight: "normal",
            }}
          >
            LivraMente
          </h1>
          <p
            className="text-center mt-0"
            style={{
              color: "#4C7235",
              fontFamily: "'Poppins', sans-serif",
              fontSize: "35px",
              fontWeight: 400,
              lineHeight: "normal",
            }}
          >
            A rede dos leitores brasileiros
          </p>
        </div>

        {/* Bloco do lado (verde claro) */}
        <div
          className="flex flex-col items-center flex-shrink-0"
          style={{
            width: '565px',
            height: '691px',
            padding: '50px',
            gap: '10px',
            borderRadius: '20px',
            border: '1px solid #8E572A',
            background: 'var(--Primary-200, #CADDBF)',
            boxSizing: 'border-box',
          }}
        >
          {/* Campo: Email ou nome de usuário */}
          <div
            style={{
              marginTop: '50px',
              width: '467px',
              height: '55px',
              padding: '10px 31px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              gap: '10px',
              borderRadius: '20px',
              background: '#FFFDF7',
              flexShrink: 0,
              boxSizing: 'border-box',
            }}
          >
            <span
              style={{
                color: '#A57955',
                fontFamily: "'Poppins', sans-serif",
                fontSize: '25px',
                fontWeight: 400,
                fontStyle: 'normal',
                lineHeight: 'normal',
              }}
            >
              Email ou nome de usuário
            </span>
          </div>

          {/* Campo: Senha */}
          <div
            style={{
              marginTop: '20px',
              width: '467px',
              height: '55px',
              padding: '10px 31px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              gap: '10px',
              borderRadius: '20px',
              background: '#FFFDF7',
              flexShrink: 0,
              boxSizing: 'border-box',
            }}
          >
            <span
              style={{
                color: '#A57955',
                fontFamily: "'Poppins', sans-serif",
                fontSize: '25px',
                fontWeight: 400,
                fontStyle: 'normal',
                lineHeight: 'normal',
              }}
            >
              Senha
            </span>
          </div>
          {/* Texto "Esqueci minha senha" */}
          <p
            style={{
              marginTop: '30px',
              width: '466.82px',
              height: '26px',
              color: '#BB9A7F',
              textAlign: 'center',
              fontFamily: "'Poppins', sans-serif",
              fontSize: '20px',
              fontWeight: 400,
              lineHeight: 'normal',
              cursor: 'pointer',
            }}
          >
            Esqueci minha senha
          </p>

          {/* Botão */}
          <button
            style={{
              marginTop: '50px',
              width: '465px',
              height: '68px',
              padding: '10px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '10px',
              borderRadius: '20px',
              border: '1px solid #4D6F39',
              background: '#7BAA5E',
              boxShadow: '0 4px 4px rgba(0, 0, 0, 0.25)',
              color: '#fff',
              fontFamily: "'Poppins', sans-serif",
              fontSize: '20px',
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            Acessar
          </button>
          {/* Texto: Não tem uma conta? */}
          <p
            style={{
              marginTop: '30px',
              width: '219px',
              height: '26px',
              color: '#BB9A7F',
              fontFamily: "'Poppins', sans-serif",
              fontSize: '20px',
              fontWeight: 400,
              lineHeight: 'normal',
              textAlign: 'center',
            }}
          >
            Não tem uma conta?
          </p>

          {/* Texto: Inscreva-se */}
          <p
            style={{
              width: '188px',
              height: '31px',
              color: '#7BAA5E',
              fontFamily: "'Poppins', sans-serif",
              fontSize: '20px',
              fontWeight: 400,
              lineHeight: 'normal',
              textAlign: 'center',
              cursor: 'pointer', // se for clicável
            }}
          >
            Inscreva-se
          </p>
        </div>
      </div>
    </div>
  );
}
