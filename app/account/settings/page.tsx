const settingItems = [
  { title: "Email updates", description: "Offers, drops, and order notifications", enabled: true },
  { title: "WhatsApp updates", description: "Delivery and order status on WhatsApp", enabled: true },
  { title: "Two-step verification", description: "Add extra security to your account", enabled: false },
  { title: "Save cards securely", description: "Use saved cards for faster checkout", enabled: false },
];

export default function AccountSettingsPage() {
  return (
    <section className="rounded-2xl border border-[#f5d6e4] bg-white p-6 sm:p-8">
      <p className="text-[13px] font-medium uppercase tracking-[0.06em] text-[#7b7b7b]">
        Preferences
      </p>
      <h1 className="mt-2 text-[32px] font-semibold leading-none text-[#1f1f1f]">
        Settings
      </h1>

      <div className="mt-7 space-y-3">
        {settingItems.map((item) => (
          <div
            key={item.title}
            className="flex items-center justify-between gap-4 rounded-xl border border-[#eceee0] bg-[#fefafc] p-4"
          >
            <div>
              <p className="text-[17px] font-medium text-[#222]">{item.title}</p>
              <p className="mt-1 text-[14px] text-[#6a6a6a]">{item.description}</p>
            </div>
            <button
              type="button"
              className={`h-7 w-13 cursor-not-allowed rounded-full p-1 transition-colors ${
                item.enabled ? "bg-[#ea206d]" : "bg-[#e8c4d4]"
              }`}
              aria-pressed={item.enabled}
              disabled
            >
              <span
                className={`block h-5 w-5 rounded-full bg-white transition-transform ${
                  item.enabled ? "translate-x-6" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        ))}
      </div>

      <p className="mt-5 text-[13px] text-[#8a8a8a]">
        Preference controls are display-only for now and will become editable
        soon.
      </p>
    </section>
  );
}
