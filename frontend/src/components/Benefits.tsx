export default function Benefits() {
  const benefits = [
    'Real-time environment awareness',
    'Hands-free operation',
    'Continuous learning and adaptation',
    'Privacy-focused processing',
  ];

  return (
    <div className="bg-white rounded-3xl shadow-sm p-6">
      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Key Benefits</h2>
      <ul className="space-y-3">
        {benefits.map((benefit, index) => (
          <li key={index} className="flex items-start gap-3">
            <div className="w-1.5 h-1.5 bg-gray-800 rounded-full mt-2 flex-shrink-0" />
            <span className="text-gray-700">{benefit}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
