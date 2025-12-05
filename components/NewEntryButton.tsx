export default function NewEntryButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="bg-blue-600 text-white px-4 py-2 rounded-lg"
    >
      + Add Animation Entry
    </button>
  );
}
