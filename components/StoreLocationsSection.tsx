import AnimateOnView from "./AnimateOnView";

const storeImage = "/assets/images/store-locations.png";

export default function StoreLocationsSection() {
  return (
    <section className="bg-white py-12 sm:py-16">
      <div className="mx-auto w-full max-w-[1320px] px-4 sm:px-6 lg:px-10">
        <AnimateOnView animation="fadeInDown" duration={0.75}>
          <h2 className="text-center text-[28px] leading-tight font-medium text-[#111] sm:text-[36px] sm:leading-none">
            Store Locations
          </h2>
        </AnimateOnView>

        <div className="mt-8 grid grid-cols-1 items-center gap-8 sm:mt-12 lg:grid-cols-[1.03fr_1.45fr] lg:gap-10">
          <AnimateOnView animation="fadeInLeft" duration={0.85}>
            <article className="relative overflow-hidden rounded-[16px] sm:rounded-[20px]">
              <div
                className="h-[360px] w-full bg-cover bg-center sm:h-[480px] lg:h-[560px]"
                style={{ backgroundImage: `url("${storeImage}")` }}
                aria-label="Katyayani Designer Hub store"
                role="img"
              />
              <div className="absolute inset-0 bg-black/30" />

              <div className="absolute inset-x-0 bottom-0 bg-black/55 px-4 py-6 text-center text-white sm:px-8 sm:py-10">
                <h3 className="text-[22px] leading-[1.15] font-semibold sm:text-[30px] lg:text-[35px] lg:leading-[1.08]">
                  Katyayani Desinger Hub
                </h3>
                <p className="mt-3 text-[14px] leading-[1.35] text-white/95 sm:mt-5 sm:text-[20px] lg:text-[24px] lg:leading-[1.25]">
                  Silver City Extension, Focal Point, Mirpur,
                </p>
                <p className="mt-1 text-[14px] leading-[1.35] text-white/95 sm:mt-2 sm:text-[20px] lg:text-[24px] lg:leading-[1.25]">
                  Dera Bassi, Punjab 140201
                </p>
              </div>
            </article>
          </AnimateOnView>

          <AnimateOnView animation="fadeInRight" delay={120} duration={0.85}>
            <div className="mb-5 sm:mb-6">
              <p className="text-[18px] leading-[1.35] font-medium text-[#111] sm:text-[22px] lg:text-[24px]">
                Have a question or need styling advice?
              </p>
              <p className="mt-2 text-[15px] leading-[1.45] text-[#666] sm:text-[17px] lg:text-[18px]">
                Share your details below and our team will get back to you soon.
              </p>
            </div>

            <form className="space-y-3 sm:space-y-4">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                <input
                  type="text"
                  name="firstName"
                  placeholder="First name"
                  className="h-12 w-full border border-[#d8d8d8] px-4 text-[16px] text-[#222] placeholder:text-[#b4b4b4] focus:outline-none sm:h-[65px] sm:px-7 sm:text-[22px]"
                />
                <input
                  type="text"
                  name="lastName"
                  placeholder="Last name"
                  className="h-12 w-full border border-[#d8d8d8] px-4 text-[16px] text-[#222] placeholder:text-[#b4b4b4] focus:outline-none sm:h-[65px] sm:px-7 sm:text-[22px]"
                />
              </div>

              <input
                type="email"
                name="email"
                placeholder="Email"
                className="h-12 w-full border border-[#d8d8d8] px-4 text-[16px] text-[#222] placeholder:text-[#b4b4b4] focus:outline-none sm:h-[65px] sm:px-7 sm:text-[22px]"
              />

              <textarea
                name="message"
                placeholder="Type here ..."
                rows={5}
                className="w-full resize-none border border-[#d8d8d8] px-4 py-3 text-[16px] text-[#222] placeholder:text-[#b4b4b4] focus:outline-none sm:px-7 sm:py-7 sm:text-[22px]"
              />

              <button
                type="submit"
                className="mt-1 min-h-11 min-w-[118px] rounded-[5px] bg-[#ea206d] px-5 py-2.5 text-[16px] font-medium text-white sm:text-[21px]"
              >
                Submit
              </button>
            </form>
          </AnimateOnView>
        </div>
      </div>
    </section>
  );
}
