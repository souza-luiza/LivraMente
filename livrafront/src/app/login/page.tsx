//import './feed.css'

// app/login/page.tsx
import Image from "next/image";
import Link from "next/link";
//import styles from "./LoginPage.module.css";
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
              <label htmlFor="password" className="sr-only">Senha</label>
              <input
                id="password"
                name="password"
                type="password"
                placeholder="Senha"
                className={styles.input}
              />
            </div>

            <Link href="/esqueci-minha-senha" className={styles.forgot}>
              Esqueci minha senha
            </Link>

            <button type="submit" className={styles.button}>
              Acessar
            </button>

            <p className={styles.signupText}>Não tem uma conta?</p>
            <Link href="/register" className={styles.signup}>
              Inscreva-se
            </Link>

          </form>
        </div>
      </div>
    </main>
  );
}
