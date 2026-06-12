export default function PlanCard({ plan, onSelect, active }) {
  return (
    <div className={`border rounded-xl p-6 flex flex-col gap-3 ${active ? "border-indigo-500 shadow-lg" : ""}`}>
      <h3 className="text-xl font-bold">{plan.name}</h3>
      <p className="text-3xl font-bold">₹{plan.price}<span className="text-sm font-normal text-gray-500"> / {plan.duration}</span></p>
      <ul className="flex flex-col gap-1">{plan.features.map((f,i) => <li key={i} className="text-sm">✓ {f}</li>)}</ul>
      <button className="bg-indigo-600 text-white py-2 rounded mt-auto" onClick={() => onSelect(plan)}>Choose Plan</button>
    </div>
  );
}
