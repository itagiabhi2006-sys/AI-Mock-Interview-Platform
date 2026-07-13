import React, { useState } from 'react'
import toast from 'react-hot-toast'

const notes = [
  { id:1, title: 'Diwali Special', body: 'Festive discounts on traditional sweets & ghee.' },
  { id:2, title: 'Blessed Dispatch', body: 'Your order will be handled with care and blessings.' },
  { id:3, title: 'Local Farmer Support', body: 'Buying local — supporting small kiranas.' }
]

export default function CenterNotifications(){
  const [open, setOpen] = useState(false)

  function openCentered(n){
    // show toast and open center panel
    toast.success(n.title + ' — ' + n.body)
    setOpen(true)
    // auto close after 6s
    setTimeout(()=> setOpen(false), 6000)
  }

  return (
    <div className="relative">
      <button onClick={()=>setOpen(v=>!v)} className="px-3 py-2 rounded-full bg-saffron-50 text-saffron-600 hover:shadow">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118.6 14.6V11a6 6 0 10-12 0v3.6c0 .538-.214 1.055-.595 1.405L4 17h5m6 0a3 3 0 11-6 0h6z" />
        </svg>
      </button>

      {open && (
        <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
          <div className="pointer-events-auto bg-white rounded-xl shadow-xl max-w-3xl w-full mx-4 p-6 border-2 border-saffron-100">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-bold text-saffron-700">Notifications</h3>
                <p className="text-sm text-gray-500">Curated updates inspired by Sanātani culture (decorative only).</p>
              </div>
              <button onClick={()=>setOpen(false)} className="text-gray-400">Close</button>
            </div>
            <div className="mt-4 grid md:grid-cols-3 gap-4">
              {notes.map(n=> (
                <div key={n.id} className="p-4 rounded-lg border bg-saffron-50">
                  <div className="font-semibold text-saffron-700">{n.title}</div>
                  <div className="text-sm text-gray-700 mt-1">{n.body}</div>
                  <div className="mt-3">
                    <button onClick={()=>openCentered(n)} className="px-3 py-1 bg-white border rounded text-sm">View</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
