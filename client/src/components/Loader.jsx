export default function Loader({ text = 'Searching...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4">
      <div className="spinner"></div>
      <p className="text-gray-500 text-sm">{text}</p>
    </div>
  )
}