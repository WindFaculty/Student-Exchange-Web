import { Link } from 'react-router-dom'

const quickLinks = [
  { to: '/products', label: 'Sản phẩm' },
  { to: '/events', label: 'Sự kiện' },
  { to: '/support', label: 'Trung tâm hỗ trợ' },
]

const contactInfo = {
  email: 'Tranxuankhoa777@gmail.com',
  phone: '0364579546',
  school: 'Đại học FPT TP.HCM',
  address: 'Lô E2a-7, Đường D1, Khu Công nghệ cao, Phường Tăng Nhơn Phú, TP. Hồ Chí Minh',
}

const Footer = () => {
  const isFptSchool = contactInfo.school.toLowerCase().includes('fpt')

  return (
    <footer className="border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-3 lg:px-8">
        <section className="space-y-3">
          <h2 className="text-base font-semibold text-slate-900 dark:text-white">Student Exchange</h2>
          <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">
            Nền tảng kết nối sinh viên và trao đổi sản phẩm
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-semibold text-slate-900 dark:text-white">Liên kết nhanh</h2>
          <nav className="flex flex-col gap-2 text-sm">
            {quickLinks.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="text-slate-600 transition-colors hover:text-primary dark:text-slate-300 dark:hover:text-primary"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </section>

        <section className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">Liên hệ</h2>
            {isFptSchool ? (
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                Trường FPT
              </span>
            ) : null}
          </div>
          <div className="space-y-1 text-sm text-slate-600 dark:text-slate-300">
            <p>
              Email:{' '}
              <a href={`mailto:${contactInfo.email}`} className="text-primary hover:underline">
                {contactInfo.email}
              </a>
            </p>
            <p>Hotline: {contactInfo.phone}</p>
            <p>Địa chỉ: {contactInfo.address}</p>
          </div>
          <Link
            to="/support/contact"
            className="inline-flex items-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition hover:bg-primary/90"
          >
            Liên hệ hỗ trợ
          </Link>
        </section>
      </div>

      <div className="border-t border-slate-200 dark:border-slate-800">
        <div className="mx-auto w-full max-w-7xl px-4 py-4 text-xs text-slate-500 dark:text-slate-400 sm:px-6 lg:px-8">
          © 2026 Student Exchange. All rights reserved.
        </div>
      </div>
    </footer>
  )
}

export default Footer
