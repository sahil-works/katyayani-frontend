const storeImage = "/assets/images/store-locations.png";

export default function StoreLocationsSection() {
  return (
    <section className="bg-white py-16">
      <div className="mx-auto w-full max-w-[1320px] px-6 lg:px-10">
        <h2 className="text-center text-[43px] leading-none font-medium text-[#111]">
          Store Locations
        </h2>

        <div className="mt-12 grid grid-cols-1 items-center gap-10 lg:grid-cols-[1.03fr_1.45fr]">
          <article className="relative overflow-hidden rounded-[20px]">
            <div
              className="h-[560px] w-full bg-cover bg-center"
              style={{ backgroundImage: `url("${storeImage}")` }}
              aria-label="Katyayani Designer Hub store"
              role="img"
            />
            <div className="absolute inset-0 bg-black/30" />

            <div className="absolute inset-x-0 bottom-0 bg-black/55 px-8 py-10 text-center text-white">
              <h3 className="text-[35px] leading-[1.08] font-semibold">
                Katyayani Desinger Hub
              </h3>
              <p className="mt-5 text-[24px] leading-[1.25] text-white/95">
                Silver City Extension, Focal Point, Mirpur,
              </p>
              <p className="mt-2 text-[24px] leading-[1.25] text-white/95">
                Dera Bassi, Punjab 140201
              </p>
            </div>
          </article>

          <form className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <input
                type="text"
                name="firstName"
                placeholder="First name"
                className="h-[65px] w-full border border-[#d8d8d8] px-7 text-[22px] text-[#222] placeholder:text-[#b4b4b4] focus:outline-none"
              />
              <input
                type="text"
                name="lastName"
                placeholder="Last name"
                className="h-[65px] w-full border border-[#d8d8d8] px-7 text-[22px] text-[#222] placeholder:text-[#b4b4b4] focus:outline-none"
              />
            </div>

            <input
              type="email"
              name="email"
              placeholder="Email"
              className="h-[65px] w-full border border-[#d8d8d8] px-7 text-[22px] text-[#222] placeholder:text-[#b4b4b4] focus:outline-none"
            />

            <textarea
              name="message"
              placeholder="Type here ..."
              rows={5}
              className="w-full resize-none border border-[#d8d8d8] px-7 py-7 text-[22px] text-[#222] placeholder:text-[#b4b4b4] focus:outline-none"
            />

            <button
              type="submit"
              className="mt-1 min-w-[118px] bg-[#9ea600] px-5 py-2 text-[21px] font-medium text-white"
            >
              Submit
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
