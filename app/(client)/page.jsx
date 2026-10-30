import Calendar from '../../components/calendar/Calendar'

export default function Home() {
  return <>
    <div className="page-head"><div><h1>Lab schedule</h1><p>See when the lab is in use, or book a slot starting now.</p></div></div>
    <Calendar />
  </>
}
