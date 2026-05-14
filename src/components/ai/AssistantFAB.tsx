import { useState } from 'react'
import { Icon } from '../ui/Icon'

interface AssistantFABProps {
  context?: string
}

interface Message {
  role: 'user' | 'assistant'
  text: string
}

const QUICK_CHIPS = [
  '今日需優先處理什麼？',
  '有哪些高風險會員？',
  '本月營收趨勢如何？',
  '異常設備清單',
]

const MOCK_REPLIES: Record<string, string> = {
  default: '根據目前數據，有 3 項需要立即關注：\n\n① 臺中 SH-2841 有 4 台設備已離線 48 小時，工單 T-22841 尚未指派。\n\n② 23 位高級會員訂閱將在 14 天內到期，建議由顧問主動聯繫。\n\n③ 春季健康月活動轉換率本週達 16.8%，建議延長至第四週。',
}

export function AssistantFAB({ context }: AssistantFABProps) {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

  const send = async (text: string) => {
    if (!text.trim()) return
    const userMsg: Message = { role: 'user', text }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)
    await new Promise(r => setTimeout(r, 800))
    setLoading(false)
    setMessages(prev => [...prev, { role: 'assistant', text: MOCK_REPLIES.default }])
  }

  return (
    <>
      {/* FAB button */}
      <button
        onClick={() => setOpen(true)}
        style={{
          position: 'fixed',
          bottom: 28,
          right: 28,
          width: 52,
          height: 52,
          borderRadius: '50%',
          background: 'var(--as-h)',
          color: '#fff',
          border: 'none',
          cursor: 'pointer',
          display: open ? 'none' : 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 16px rgba(217,119,6,0.35)',
          zIndex: 100,
        }}
      >
        <Icon name="sparkles" size={20} />
        <span style={{
          position: 'absolute',
          top: -2,
          right: -2,
          width: 18,
          height: 18,
          background: 'var(--as-danger)',
          borderRadius: '50%',
          fontSize: 10,
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '2px solid #fff',
        }}>8</span>
      </button>

      {/* Chat panel */}
      {open && (
        <div style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          width: 380,
          height: 520,
          background: '#fff',
          border: '1px solid var(--as-line)',
          borderRadius: 14,
          boxShadow: 'var(--sh-lg)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 200,
          overflow: 'hidden',
        }}>
          {/* Header */}
          <div style={{
            padding: '14px 16px',
            borderBottom: '1px solid var(--as-line)',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            background: 'linear-gradient(90deg, var(--as-h-tint) 0%, #fff 100%)',
          }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: 'var(--as-h)', color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Icon name="sparkles" size={16} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--as-h-ink)' }}>AI 特助</div>
              <div style={{ fontSize: 11, color: 'var(--as-mute)' }}>
                {context ?? 'AirSure 數據中台'} · Claude Haiku
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--as-mute)', padding: 4 }}
            >
              <Icon name="x" size={16} />
            </button>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {messages.length === 0 && (
              <div style={{ marginTop: 12 }}>
                <div style={{ fontSize: 12, color: 'var(--as-mute)', marginBottom: 10 }}>快速提問</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {QUICK_CHIPS.map(chip => (
                    <button
                      key={chip}
                      onClick={() => send(chip)}
                      style={{
                        background: 'var(--as-h-tint)',
                        border: '1px solid #FED7AA',
                        borderRadius: 20,
                        padding: '5px 12px',
                        fontSize: 12,
                        color: 'var(--as-h-ink)',
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                      }}
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} style={{
                display: 'flex',
                justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start',
              }}>
                <div style={{
                  maxWidth: '85%',
                  padding: '9px 13px',
                  borderRadius: m.role === 'user' ? '14px 14px 4px 14px' : '4px 14px 14px 14px',
                  background: m.role === 'user' ? 'var(--as-h)' : 'var(--as-bg)',
                  color: m.role === 'user' ? '#fff' : 'var(--as-ink)',
                  fontSize: 13,
                  lineHeight: 1.6,
                  whiteSpace: 'pre-wrap',
                }}>
                  {m.text}
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ display: 'flex', gap: 4, padding: '6px 2px' }}>
                {[0, 1, 2].map(i => (
                  <div key={i} style={{
                    width: 7, height: 7, borderRadius: '50%',
                    background: 'var(--as-h)',
                    opacity: 0.5,
                    animation: `pulse 1s ${i * 0.2}s infinite`,
                  }} />
                ))}
              </div>
            )}
          </div>

          {/* Input */}
          <div style={{
            padding: '10px 12px',
            borderTop: '1px solid var(--as-line)',
            display: 'flex',
            gap: 8,
          }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && send(input)}
              placeholder="輸入問題…"
              style={{
                flex: 1,
                height: 36,
                border: '1px solid var(--as-line)',
                borderRadius: 8,
                padding: '0 12px',
                fontSize: 13,
                fontFamily: 'inherit',
                background: 'var(--as-bg)',
                outline: 'none',
              }}
            />
            <button
              onClick={() => send(input)}
              style={{
                width: 36, height: 36,
                background: 'var(--as-h)',
                border: 'none',
                borderRadius: 8,
                color: '#fff',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon name="send" size={15} />
            </button>
          </div>
        </div>
      )}
    </>
  )
}
