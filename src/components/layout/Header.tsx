import { Icon } from '../ui/Icon'

interface HeaderProps {
  title: string
  breadcrumb?: string
}

export function Header({ title, breadcrumb }: HeaderProps) {
  return (
    <header className="as-header">
      <div className="crumbs">
        <span>克立淨數據中台</span>
        {breadcrumb && <><span>›</span><span>{breadcrumb}</span></>}
        <span>›</span>
        <span className="cur">{title}</span>
      </div>
      <div className="search">
        <span className="si"><Icon name="search" size={14} /></span>
        <input placeholder="搜尋會員、場域、設備、工單…" />
      </div>
      <div className="right">
        <button className="timepick">
          <Icon name="cal" size={14} />
          今日 · 2026/05/14
        </button>
        <button className="iconbtn">
          <Icon name="refresh" size={16} />
        </button>
        <button className="iconbtn">
          <Icon name="bell" size={16} />
          <span className="dot" />
        </button>
      </div>
    </header>
  )
}
