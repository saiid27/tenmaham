import { useState } from 'react'
import './App.css'

const SHEET_CSV_URL =
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vSQh8LBLRkuVJDbRg07NniV0hVdimSSjuYK6YktvhhEHM5MZhqS5w_Njbx_udgeM8htBMVaVGS1xgW_/pub?output=csv'

function App() {
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [status, setStatus] = useState('')
  const [statusType, setStatusType] = useState('info')
  const [loading, setLoading] = useState(false)

  const showStatus = (message, type = 'info') => {
    setStatus(message)
    setStatusType(type)
  }

  const handleLogin = async () => {
    showStatus('', 'info')
    if (!phone.trim() || !password.trim()) {
      showStatus('يرجى إدخال الرقم وكلمة المرور.', 'error')
      return
    }
    setLoading(true)
    try {
      const res = await fetch(SHEET_CSV_URL)
      if (!res.ok) throw new Error('خطأ في  البيانات.')
      const csv = await res.text()

      const parseRow = (row) => {
        const cleaned = row.replace(/^\uFEFF/, '')
        const matches = cleaned.match(/(".*?"|[^",]+)(?=,|$)/g) || []
        return matches.map((cell) => cell.replace(/^"|"$/g, '').trim())
      }

      const rows = csv
        .split(/\r?\n/)
        .map((r) => r.trim())
        .filter(Boolean)
        .map(parseRow)

      // الأعمدة: A = الرقم، B = كلمة المرور، C = رابط التوجيه (الصف الأول عناوين)
      const dataRows = rows.slice(1)

      const match = dataRows.find(
        (cols) => cols[0]?.trim() === phone.trim() && cols[1]?.trim() === password.trim()
      )

      if (match) {
        const target = match[2]?.trim()
        if (target) {
          const normalized = /^https?:\/\//i.test(target) ? target : `https://${target}`
          showStatus('تم التحقق بنجاح.', 'success')
          setTimeout(() => {
            window.location.assign(normalized)
          }, 300)
          return
        }
        showStatus('تم التحقق، .', 'error')
      } else {
        showStatus('البيانات غير صحيحة.', 'error')
      }
    } catch (err) {
      showStatus('تعذر الاتصال  . حاول لاحقاً.', 'error')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page" dir="rtl">
      <div className="bg-gradient" aria-hidden />
      <div className="phone-frame">
        <main className="login-shell">
          <header className="login-header">
            <img className="brand-logo" src="/elmou.jpg" alt="Logo" />
            <h1>مرحباً بك في منصة تن محم الثقافية</h1>
          </header>

          <section className="login-card">
            <div className="avatar">
              <span aria-hidden>👤</span>
            </div>

            <label className="field">
              <span className="field-label">الرقم</span>
              <input
                type="text"
                placeholder="رقم الهاتف أو المعرف"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </label>

            <label className="field">
              <span className="field-label">كلمة المرور</span>
              <input
                type="password"
                placeholder="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </label>

            <button type="button" className="cta primary" onClick={handleLogin} disabled={loading}>
              {loading ? 'جار التحقق...' : 'تسجيل الدخول '}
            </button>

            <div className={`status ${statusType}`}>{status}</div>

            <div className="help">
              <a href="https://api.whatsapp.com/send/?phone=%2B22234605765&text&type=phone_number&app_absent=0">نسيت كلمة المرور؟</a>
              <a
                className="link-btn"
                href="https://docs.google.com/forms/d/e/1FAIpQLSd18leWhXOJ1rATGxIn0sas7_-TVPU-iE3URiBu8EyUk6JDKQ/viewform?usp=header"
                target="_blank"
                rel="noreferrer"
              >
                إنشاء حساب جديد
              </a>
            </div>
          </section>
        </main>
      </div>
    </div>
  )
}

export default App
