export const metadata = {
  title: 'Пользовательское соглашение - Agent Marketplace',
}

export default function TermsPage() {
  return (
    <div className="container py-10 max-w-3xl">
      <h1 className="text-3xl font-bold mb-8">Пользовательское соглашение</h1>
      
      <div className="space-y-6 text-slate-300">
        <section>
          <h2 className="text-xl font-semibold mb-3">1. Общие положения</h2>
          <p>Настоящее пользовательское соглашение (далее — «Соглашение») регулирует отношения между платформой Agent Marketplace (далее — «Платформа») и пользователями.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">2. Регистрация</h2>
          <p>Для использования Платформы необходимо зарегистрировать аккаунт. Пользователь несёт ответственность за достоверность данных и безопасность своего пароля.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">3. Размещение агентов</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Продавец может размещать AI-агентов в формате ZIP-архива</li>
            <li>Продавец устанавливает цену самостоятельно</li>
            <li>Платформа взимает комиссию 30% от каждой продажи</li>
            <li>Запрещено размещать вредоносный или нарушающий права第三方 код</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">4. Покупка агентов</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Покупатель оплачивает агента через OxaPay (USDT)</li>
            <li>После оплаты покупатель получает право на скачивание и использование агента</li>
            <li>Возврат возможен в течение 14 дней при технических проблемах</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">5. Комиссии и вывод средств</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Комиссия Платформы: 30% от стоимости агента</li>
            <li>Вывод средств доступен через раздел «Кабинет»</li>
            <li>Минимальная сумма для вывода: $10</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">6. Ответственность</h2>
          <p>Платформа не несёт ответственности за качество агентов, размещаемых продавцами. Пользователи самостоятельно оценивают риски перед покупкой.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">7. Контакты</h2>
          <p>По вопросам: support@agentmarketplace.com</p>
        </section>
      </div>

      <div className="mt-12 text-center text-slate-500">
        <a href="/" className="text-primary">На главную</a>
      </div>
    </div>
  )
}
