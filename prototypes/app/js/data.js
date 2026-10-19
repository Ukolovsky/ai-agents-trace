/* Единые моковые данные демо-компании. Имена и числа взяты из макетов Figma BP-CPQ-AI
   (Импорт U1–U9, ИИ поиск, Task tracker, Платежи подрядчикам). Всё, что меняет пользователь,
   хранится в localStorage поверх этого файла (см. store.js). */
window.DEMO_DATA = {
  company: { name: 'ГК «Стройка»', city: 'Смоленск', user: 'Алексей Морозов', role: 'Руководитель снабжения' },
  today: '18.08.2026',

  counterparties: [
    { id: 'cp-stroymonolit', name: 'ООО «СтройМонолит»', inn: '6730123456', kpp: '673001001',
      address: '214000, г. Смоленск, ул. Октябрьской Революции, д. 12', role: 'Поставщик',
      status: 'Действующий', manager: 'Алексей Морозов', since: '01.09.2025', phone: '+7 (4812) 55-12-40', email: 'sales@stroymonolit.ru' },
    { id: 'cp-omega', name: 'ООО «Омега»', inn: '6732014587', kpp: '673201001', address: 'г. Смоленск, ул. Ленина, д. 4', role: 'Подрядчик', status: 'Действующий', manager: 'Ирина Котова', since: '12.03.2025' },
    { id: 'cp-beta', name: 'ООО «Бета»', inn: '6731112233', kpp: '673101001', address: 'г. Смоленск, пр. Гагарина, д. 18', role: 'Подрядчик', status: 'Действующий', manager: 'Ирина Котова', since: '20.01.2026' },
    { id: 'cp-vselennaya', name: 'ООО «Вселенная»', inn: '6729887766', kpp: '672901001', address: 'г. Смоленск, ул. Багратиона, д. 9', role: 'Подрядчик', status: 'На проверке', manager: 'Павел Орлов', since: '05.05.2026' },
    { id: 'cp-fi', name: 'ООО «Фи»', inn: '6730556677', kpp: '673001001', address: 'г. Смоленск, ул. Кирова, д. 22', role: 'Подрядчик', status: 'Действующий', manager: 'Павел Орлов', since: '11.11.2025' },
    { id: 'cp-tau', name: 'ООО «Тау»', inn: '6733445566', kpp: '673301001', address: 'г. Смоленск, ул. Нормандия-Неман, д. 3', role: 'Подрядчик', status: 'Действующий', manager: 'Ирина Котова', since: '02.02.2026' },
    { id: 'cp-ipsilon', name: 'ООО «Ипсилон»', inn: '6734221100', kpp: '673401001', address: 'г. Смоленск, ул. Дзержинского, д. 7', role: 'Арендатор', status: 'Действующий', manager: 'Павел Орлов', since: '15.06.2025' }
  ],

  products: [
    { id: 'pr-cement', name: 'Цемент М500 (мешок 50 кг)', unit: 'мешок', price: 844, article: 'CEM-M500-50', group: 'Сыпучие материалы', supplier: 'cp-stroymonolit', stock: 120 },
    { id: 'pr-brick', name: 'Кирпич керамический рядовой М150', unit: 'шт', price: 55, article: 'BRK-M150', group: 'Стеновые материалы', supplier: 'cp-stroymonolit', stock: 18000 },
    { id: 'pr-beton', name: 'Бетон B25 (М350)', unit: 'м³', price: 6200, article: 'BET-B25', group: 'Бетон и растворы', supplier: 'cp-omega', stock: 0 },
    { id: 'pr-peskok', name: 'Песок строительный мытый', unit: 'т', price: 780, article: 'SND-W', group: 'Сыпучие материалы', supplier: 'cp-beta', stock: 40 }
  ],

  processes: [
    { id: 'proc-in-docs', name: 'Входящие документы', type: 'Документ', owner: 'Алексей Морозов', stages: ['Регистрация', 'Проверка', 'Согласование', 'Архив'], description: 'Регистрация входящих первичных документов: накладные, счета, акты.' },
    { id: 'proc-priemka', name: 'Приёмка товара', type: 'Материальный поток', owner: 'Павел Орлов', stages: ['Ожидает поставки', 'Приёмка', 'Оприходовано'], description: 'Приёмка стройматериалов на склад объекта по накладной.' },
    { id: 'proc-kontragenty', name: 'Стройка контрагенты', type: 'Контрагенты', owner: 'Ирина Котова', stages: ['Черновик', 'Проверка', 'Действующий'], description: 'Заведение и проверка контрагентов стройки.' },
    { id: 'proc-materials', name: 'Стройматериалы', type: 'Товары', owner: 'Павел Орлов', stages: ['Черновик', 'Проверка', 'В каталоге'], description: 'Справочник материалов, применяемых на объектах.' },
    { id: 'proc-deal', name: 'Согласование сделки', type: 'Сделка', owner: 'Алексей Морозов', stages: ['Подготовка', 'Согласование КД', 'Подписание', 'Исполнение'], description: 'Согласование договоров с поставщиками.' },
    { id: 'proc-payments', name: 'Платежи подрядчикам', type: 'Финансовая операция', owner: 'Ирина Котова', stages: ['Запланирован', 'На согласовании', 'На утверждении', 'Оплачен'], description: 'Согласование и проведение платежей подрядчикам.' }
  ],

  documents: [
    { id: 'doc-dog-118', name: 'Договор поставки № 118-П от 02.06.2026', type: 'Договор', counterparty: 'cp-stroymonolit', date: '02.06.2026', updated: '03.05.2026', amount: 2400000, status: 'Действует', process: 'proc-deal', file: 'Договор_118-П.pdf' },
    { id: 'doc-sm-14', name: 'Договор поставки № SM-2026/14.pdf', type: 'PDF', counterparty: 'cp-stroymonolit', date: '03.05.2026', updated: '03.05.2026', amount: 0, status: 'Архив', process: 'proc-in-docs', file: 'Договор поставки № SM-2026/14.pdf' },
    { id: 'doc-schet-1251', name: 'Счёт № 1251 от 28.07.2026', type: 'Счёт', counterparty: 'cp-omega', date: '28.07.2026', updated: '28.07.2026', amount: 458000, status: 'На согласовании', process: 'proc-payments', file: 'Счёт_1251.pdf' },
    { id: 'doc-akt-77', name: 'Акт выполненных работ № 77', type: 'Акт', counterparty: 'cp-beta', date: '30.07.2026', updated: '31.07.2026', amount: 126500, status: 'Подписан', process: 'proc-in-docs', file: 'Акт_77.pdf' }
  ],

  instances: [
    { id: 'in-deal-1258', name: 'Сделка №1258 - услуги ООО «СтройМонолит»', process: 'proc-deal', counterparty: 'cp-stroymonolit', stage: 'Согласование КД', status: 'В работе', updated: '17.08.2026', amount: 1240000 },
    { id: 'in-deal-1251', name: 'Сделка №1251 - услуги ООО «Омега»', process: 'proc-deal', counterparty: 'cp-omega', stage: 'Подписание', status: 'В работе', updated: '12.08.2026', amount: 458000 },
    { id: 'in-priemka-0811', name: 'Приёмка поставки #0811', process: 'proc-priemka', counterparty: 'cp-stroymonolit', stage: 'Оприходовано', status: 'Завершён', updated: '15.07.2026', amount: 312400 },
    { id: 'in-cp-omega', name: 'Проверка контрагента ООО «Омега»', process: 'proc-kontragenty', counterparty: 'cp-omega', stage: 'Действующий', status: 'Завершён', updated: '12.03.2025', amount: 0 }
  ],

  tasks: [
    { id: 't-check-docs', name: 'Проверить документы от СтройМонолит', counterparty: 'cp-stroymonolit', assignee: 'Алексей Морозов', due: '18.08.2026', status: 'В работе', priority: 'Высокий' },
    { id: 't-sogl', name: 'Согласовать условия сделки №1258', counterparty: 'cp-stroymonolit', assignee: 'Алексей Морозов', due: '22.08.2026', status: 'Новая', priority: 'Средний' },
    { id: 't-omega-pay', name: 'Подготовить оплату счёта № 1251', counterparty: 'cp-omega', assignee: 'Ирина Котова', due: '20.08.2026', status: 'Новая', priority: 'Средний' },
    { id: 't-zapasy', name: 'Оптимизация управления запасами', counterparty: null, assignee: 'Павел Орлов', due: '25.09.2026', status: 'В работе', priority: 'Средний' }
  ],

  meetings: [
    { id: 'm-sync', name: 'Синк лидов', date: '07.09.2026', time: '18:00 - 19:00', participants: 4, counterparty: null, status: 'Предстоящая' },
    { id: 'm-monolit', name: 'Встреча по поставке с ООО «СтройМонолит»', date: '21.08.2026', time: '11:00 - 12:00', participants: 3, counterparty: 'cp-stroymonolit', status: 'Предстоящая' }
  ],

  finops: [
    { id: 'fo-1', counterparty: 'cp-stroymonolit', name: 'Оплата поставки цемента', op: 'Оплата поставщику', status: 'Оплачен', stage: 'Исполнение', date: '18.08.2026', amount: 458000 },
    { id: 'fo-2', counterparty: 'cp-omega', name: 'Покупка стульев для офиса', op: 'Доход от подработки', status: 'На согласовании', stage: 'Согласование КД', date: '03.05.2026', amount: 120000 },
    { id: 'fo-3', counterparty: 'cp-beta', name: 'Покупка мебели', op: 'Инвестиционный доход', status: 'Оплачен', stage: 'Согласование КД', date: '03.05.2026', amount: 120000 },
    { id: 'fo-4', counterparty: 'cp-vselennaya', name: 'Покупка ноутбука', op: 'Оплата труда в «Свет»', status: 'На утверждении', stage: 'Согласование КД', date: '03.05.2026', amount: 120000 },
    { id: 'fo-5', counterparty: 'cp-fi', name: 'Покупка телефонов', op: 'Реализация цифровых...', status: 'Запланирован', stage: 'Согласование КД', date: '03.05.2026', amount: 120000 },
    { id: 'fo-6', counterparty: 'cp-tau', name: 'Покупка мебели', op: 'Реализация цифровых...', status: 'На согласовании', stage: 'Подписание', date: '04.05.2026', amount: 86000 },
    { id: 'fo-7', counterparty: 'cp-ipsilon', name: 'Покупка ноутбука', op: 'Поступления от аренды', status: 'Оплачен', stage: 'Исполнение', date: '05.05.2026', amount: 64000 },
    { id: 'fo-8', counterparty: 'cp-omega', name: 'Покупка бумаги', op: 'Презент от коллеги', status: 'Просрочен', stage: 'Проверка', date: '06.05.2026', amount: 12000 },
    { id: 'fo-9', counterparty: 'cp-beta', name: 'Покупка стульев для зала', op: 'Приобретение канцтоваров', status: 'Согласован', stage: 'Регистрация', date: '07.05.2026', amount: 45000 },
    { id: 'fo-10', counterparty: 'cp-stroymonolit', name: 'Аванс по договору 118-П', op: 'Оплата поставщику', status: 'Оплачен', stage: 'Исполнение', date: '10.06.2026', amount: 520000 },
    { id: 'fo-11', counterparty: 'cp-stroymonolit', name: 'Оплата кирпича М150', op: 'Оплата поставщику', status: 'На согласовании', stage: 'Согласование КД', date: '12.08.2026', amount: 262000 },
    { id: 'fo-12', counterparty: 'cp-fi', name: 'Покупка телефонов', op: 'Приз в лотерее «Удача»', status: 'Запланирован', stage: 'Утверждение', date: '14.08.2026', amount: 38000 }
  ],

  reports: [ { id: 'rep-postavki', name: 'Отчёт по поставкам стройматериалов', updated: '15.08.2026', text: 'поставки СтройМонолит цемент кирпич' } ],
  settings: [ { id: 'set-integr', name: 'Интеграции: CRM Analytics', updated: '01.08.2026', text: 'база данных интеграция СтройМонолит выгрузка' } ],
  wiki: [ { id: 'wiki-priemka', name: 'Регламент приёмки товара на объекте', updated: '10.07.2026', text: 'приёмка товарная накладная ТОРГ-12 СтройМонолит' } ],

  /* Событийная лента: для блока «Последняя активность» и тепловой карты в поиске */
  events: [
    { date: '18.08.2026', who: 'Финансы', text: 'Создана финансовая операция на 458 000 ₽', counterparty: 'cp-stroymonolit' },
    { date: '17.08.2026', who: 'Алексей Морозов', text: 'Задача «Проверить документы» переведена в работу', counterparty: 'cp-stroymonolit' },
    { date: '12.08.2026', who: 'Финансы', text: 'Платёж «Оплата кирпича М150» отправлен на согласование', counterparty: 'cp-stroymonolit' },
    { date: '15.07.2026', who: 'Процессы', text: 'Завершён экземпляр «Приёмка поставки #0811»', counterparty: 'cp-stroymonolit' },
    { date: '02.06.2026', who: 'Документы', text: 'Подписан договор поставки № 118-П', counterparty: 'cp-stroymonolit' }
  ],

  /* Демо-файлы для импорта через MagicPad */
  demoFiles: [
    { id: 'file-tn-0842', name: 'Товарная накладная ТН-0842.pdf', size: '412 КБ', kind: 'pdf', readable: true },
    { id: 'file-scan', name: 'Скан_накладной_плохое_качество.jpg', size: '2,1 МБ', kind: 'jpg', readable: false }
  ],

  /* Что «распознаёт» Феликс в ТН-0842 (U4, U4.1): ключ = data-f у фрагмента документа */
  recognition: {
    title: 'Товарная накладная № ТН-0842',
    description: 'Товарная накладная № ТН-0842 от 10.07.2026.',
    fields: [
      { key: 'number', label: 'Номер документа', value: 'ТН-0842', conf: 99, src: 'страница 1, заголовок' },
      { key: 'date', label: 'Дата документа', value: '10.07.2026', conf: 99, src: 'страница 1, заголовок' },
      { key: 'form', label: 'Форма документа', value: 'ТОРГ-12', conf: 91, src: 'левый верхний угол, строка «Унифицированная форма № ТОРГ-12»' },
      { key: 'shipper', label: 'Грузоотправитель', value: 'ООО «СтройМонолит»', conf: 97, src: 'страница 1, строка «Грузоотправитель»' },
      { key: 'shipperAddr', label: 'Адрес грузоотправителя', value: '214000, г. Смоленск, ул. Октябрьской Революции, д. 12', conf: 91, src: 'строка «Грузоотправитель» после названия организации' },
      { key: 'shipperInn', label: 'ИНН грузоотправителя', value: '6730123456', conf: 99, src: 'строка «Грузоотправитель»' },
      { key: 'shipperKpp', label: 'КПП грузоотправителя', value: '673001001', conf: 99, src: 'строка «Грузоотправитель»' },
      { key: 'consignee', label: 'Грузополучатель', value: 'ООО «Инвест', conf: 0, attention: true, required: true, src: 'страница 1, строка «Грузополучатель»' },
      { key: 'consigneeAddr', label: 'Адрес грузополучателя', value: '214031, г. Смоленск, ул. Индустриальная, д. 5', conf: 91, src: 'строка «Грузополучатель»' },
      { key: 'consigneeInn', label: 'ИНН грузополучателя', value: '6731987654', conf: 99, src: 'строка «Грузополучатель»' },
      { key: 'consigneeKpp', label: 'КПП грузополучателя', value: '673101001', conf: 99, src: 'строка «Грузополучатель»' },
      { key: 'supplier', label: 'Поставщик', value: 'ООО «СтройМонолит»', conf: 95, src: 'строка «Поставщик»' },
      { key: 'payer', label: 'Плательщик', value: 'ООО «ИнвестСтрой»', conf: 95, src: 'строка «Плательщик»' },
      { key: 'basis', label: 'Основание (договор поставки)', value: 'Договор поставки № 118-П от 02.06.2026', conf: 93, src: 'строка «Основание»' },
      { key: 'ttn', label: 'Номер транспортной накладной', value: '', conf: 0, attention: true, required: true, src: 'не найдено: выделите фрагмент в документе' },
      { key: 'item1', label: 'Наименование товара 1', value: 'Цемент М500 (мешок 50 кг)', conf: 91, src: 'таблица товаров, строка 1, колонка «Товар»' },
      { key: 'item2', label: 'Наименование товара 2', value: 'Кирпич керамический рядовой М150', conf: 91, src: 'таблица товаров, строка 2, колонка «Товар»' },
      { key: 'item3', label: 'Наименование товара 3', value: 'Арматура А500С Ø12 мм (пруток 11,7 м)', conf: 91, src: 'таблица товаров, строка 3, колонка «Товар»' },
      { key: 'total', label: 'Итого (с НДС), ₽', value: '486 200,00', conf: 98, src: 'строка «Итого (с НДС)»' },
      { key: 'vat', label: 'В т. ч. НДС 20%, ₽', value: '81 033,33', conf: 98, src: 'строка «в т. ч. НДС 20%»' },
      { key: 'positions', label: 'Всего наименований', value: '3', conf: 96, src: 'строка «Всего наименований»' },
      { key: 'places', label: 'Всего мест', value: '15', conf: 88, src: 'строка «Всего мест»' },
      { key: 'netto', label: 'Масса груза нетто, кг', value: '3 200', conf: 86, src: 'строка «Масса груза»' },
      { key: 'brutto', label: 'Масса груза брутто, кг', value: '3 350', conf: 86, src: 'строка «Масса груза»' }
    ],
    items: [
      { n: 1, name: 'Цемент М500 (мешок 50 кг)', unit: 'мешок', qty: 50, price: 844, sum: 42200, match: 'pr-cement' },
      { n: 2, name: 'Кирпич керамический рядовой М150', unit: 'шт', qty: 6000, price: 55, sum: 330000, match: 'pr-brick' },
      { n: 3, name: 'Арматура А500С Ø12 мм (пруток 11,7 м)', unit: 'шт', qty: 120, price: 950, sum: 114000, match: null }
    ],
    parties: [
      { role: 'Грузоотправитель и поставщик', name: 'ООО «СтройМонолит»', inn: '6730123456', kpp: '673001001', address: '214000, г. Смоленск, ул. Октябрьской Революции, д. 12', match: 'cp-stroymonolit' },
      { role: 'Грузополучатель и плательщик', name: 'ООО «ИнвестСтрой»', inn: '6731987654', kpp: '673101001', address: '214031, г. Смоленск, ул. Индустриальная, д. 5', match: null }
    ]
  },

  /* Ссылки на документы и макеты (блок «Документы» на стартовой) */
  links: {
    portal: 'https://ukolovsky.github.io/ai-agents-trace/prototypes/',
    figma: 'https://www.figma.com/design/9bmJSWOAo6FZpeYPab4TOc/BP-CPQ-AI',
    agents: 'https://ukolovsky.github.io/ai-agents-trace/ver-2/'
  }
};
