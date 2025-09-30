// app/login/page.tsx
import Image from "next/image";
import Link from "next/link";
import styles from "./login.module.css";


export default function LoginPage() {
  return (
    <main className={styles.main}>
      <div className={styles.container}>

        {/* Lado Esquerdo */}
        <div className={styles.left}>
          <Image
            src="/logo.png"
            alt="Logo"
            width={242}
            height={225}
            priority
          />
          <h1 className={styles.logoTitle}>LivraMente</h1>
          <p className={styles.logoSubtitle}>A rede dos leitores brasileiros</p>
        </div>

        {/* Lado Direito */}
        <div className={styles.right}>
          <form className={styles.form}>

            <div className={styles.field}>
              <Image
                src="/images/at-sign.svg"
                alt="Ícone de email"
                width={24}
                height={24}
                className={styles.inputIcon}
              />
              <label htmlFor="email" className="sr-only">
                Email ou nome de usuário
              </label>
              <input
                id="email"
                name="email"
                type="text"
                placeholder="Email ou nome de usuário"
                className={styles.input}
              />
            </div>

            <div className={styles.field}>
              <Image
                src="/images/lock.svg"
                alt="Ícone de cadeado"
                width={24}
                height={24}
                className={styles.inputIcon}
              />
              <label htmlFor="password" className="sr-only">
                Senha
              </label>
              <input
                id="password"
                name="password"
                type="password"
                placeholder="Senha"
                className={styles.input}
              />
            </div>

            <div className={styles.forgotContainer}>
              <Link href="/esqueci-minha-senha" className={styles.forgot}>
                Esqueci minha senha...
              </Link>
            </div>

            <button
              type="button" className={`${styles.socialButton} ${styles.accessButton}`}>
              Acessar
            </button>

            <div className={styles.separator}>
              <div className={styles.line} />
              <span className={styles.text}>ou</span>
              <div className={styles.line} />
            </div>

            {/* Google Login */}
            <button
              type="button"
              className={`${styles.socialButton} ${styles.googleButton}`}
            >
              <Image src="/logos/google-logo.png" alt="Google Logo" width={26} height={26} />
              <span>Fazer login com Google</span>
            </button>

            {/* Apple Login */}
            <button
              type="button"
              className={`${styles.socialButton} ${styles.appleButton}`}
            >
              <Image src="/logos/apple-logo.png" alt="Apple Logo" width={24} height={24} />
              <span>Fazer login com Apple</span>
            </button>

            <p className={styles.signupText}>
              Não tem uma conta?
            </p>
            <Link href="/register" className={styles.signup}>
              Inscreva-se
            </Link>

          </form>
        </div>
      </div>
    </main>
  );
}
