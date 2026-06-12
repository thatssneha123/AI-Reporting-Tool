import PlanCard from "../components/subscription/PlanCard";
const PLANS = [
  { id: "basic", name: "Basic", price: 299, duration: "1 Month", features: ["Limited dataset uploads","Basic analysis","Email support"] },
  { id: "pro", name: "Pro", price: 799, duration: "2 Months", features: ["Higher usage limits","Advanced insights","Priority support"] },
  { id: "enterprise", name: "Enterprise", price: 1999, duration: "3 Months", features: ["Unlimited analysis","Priority processing","Dedicated support"] },
];
export default function Subscription() {
  const handle = (plan) => alert(`Redirecting to payment for ${plan.name}...`);
  return <div className="max-w-4xl mx-auto p-6"><h2 className="text-2xl font-bold mb-8">Choose a Plan</h2><div className="grid grid-cols-1 md:grid-cols-3 gap-6">{PLANS.map(p => <PlanCard key={p.id} plan={p} onSelect={handle} />)}</div></div>;
}
