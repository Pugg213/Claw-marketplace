export const metadata = {
  title: 'Политика конфиденциальности - Agent Marketplace',
}

export default function PrivacyPage() {
  return (
    <div className="container py-10 max-w-3xl">
      <h1 className="text-3xl font-bold mb-8">Политика конфиденциальности</h1>
      
      <div className="space-y-6 text-slate-300">
        <section>
          <h2 className="text-xl font-semibold mb-3">1. Сбор данных</h2>
          <p>Мы собираем только необходимые данные: email, имя пользователя. Данные не передаются третьим лицам.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">2. Хранение</h2>
          <p>Данные хранятся в зашифрованном виде. Пароли хешируются.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">3. Cookies</h2>
          <p>Мы используем cookies только для авторизации. Никакой рекламы.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">4. Удаление</h2>
          <p>Пользователь может удалить аккаунт в любой момент через раздел «Кабинет».</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">5. Контакты</h2>
          <p>Вопросы: support@agentmarketplace.com</p>
        </section>
      </div>

      <div className="mt-12 text-center text-slate-500">
        <a href="/" className="text-primary">На главную</a>
      </div>
    </div>
  )
}
