import Link from 'next/link'

export default function HelpPage() {
  return (
    <div className="container py-10 max-w-3xl">
      <h1 className="text-3xl font-bold mb-8">Как пользоваться платформой</h1>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">🛒 Как купить агента</h2>
        <ol className="list-decimal pl-6 space-y-2 text-slate-300">
          <li>Зарегистрируйтесь на платформе</li>
          <li>Найдите агента в каталоге или через поиск</li>
          <li>Нажмите "Купить" на странице агента</li>
          <li>Оплатите через OxaPay (USDT)</li>
          <li>После оплаты скачайте агента в кабинете</li>
        </ol>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">💰 Как продавать агентов</h2>
        <ol className="list-decimal pl-6 space-y-2 text-slate-300">
          <li>Зарегистрируйтесь и войдите в кабинет</li>
          <li>Перейдите на страницу "Продать"</li>
          <li>Загрузите ZIP-архив с агентом (код, промпты, настройки)</li>
          <li>Укажите название, описание, категорию и цену</li>
          <li>После модерации агент появится в каталоге</li>
        </ol>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">🤖 Подключение OpenClaw Dashboard</h2>
        <p className="text-slate-300 mb-4">
          Для управления агентами на вашем VPS:
        </p>
        <ol className="list-decimal pl-6 space-y-2 text-slate-300">
          <li>Перейдите в раздел "Dashboard"</li>
          <li>Нажмите "Подключить" и введите URL вашего OpenClaw Gateway</li>
          <li>Введите ваш OpenClaw токен</li>
          <li>Нажмите "Подключиться"</li>
        </ol>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">💳 Оплата и вывод средств</h2>
        <ul className="list-disc pl-6 space-y-2 text-slate-300">
          <li>Оплата принимается в USDT (TRC20, ERC20)</li>
          <li>Комиссия платформы — 30% от продажи</li>
          <li>Вывод средств — через раздел "Кабинет"</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">❓ FAQ</h2>
        <div className="space-y-4">
          <div>
            <div className="font-medium">Что входит в ZIP архив агента?</div>
            <div className="text-slate-400">Код агента, промпты, конфигурация, инструкция по установке.</div>
          </div>
          <div>
            <div className="font-medium">Можно ли обновлять агента после продажи?</div>
            <div className="text-slate-400">Да, продавец может загрузить новую версию. Покупатели получат уведомление.</div>
          </div>
          <div>
            <div className="font-medium">Нужно ли платить за размещение?</div>
            <div className="text-slate-400">Нет, размещение бесплатно. Платформа берет 30% с продаж.</div>
          </div>
        </div>
      </section>

      <div className="text-center mt-12">
        <Link href="/" className="text-primary">На главную</Link>
      </div>
    </div>
  )
}
