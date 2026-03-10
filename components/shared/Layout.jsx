import Image from "next/image";

// comment
import { ManufacturerProvider } from "@/contexts/manufacturers";
import { ProductProvider } from "@/contexts/product";
import { ProjectProvider } from "@/contexts/project";
import { SalesPersonProvider } from "@/contexts/salesperson";
import { StateCityProvider } from "@/contexts/state_city";
import { VendorsProvider } from "@/contexts/vendors";
import { CompanyProvider } from "@/contexts/companies";
import { LocalStorageService } from "@/services/LocalStorageHandler";
import { ornateLogo } from "@/utils/images";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "./Sheet";
import Sidebar from "./Sidebar";

function Layout({ children }) {
  const [user, setUser] = useState(null);
  const [accessibility, setAccessibility] = useState(null);

  const router = useRouter();
  const currentUrl = router.asPath;

  useEffect(() => {
    const userInfo = LocalStorageService.get("user");
    const token = LocalStorageService.get("access_token");
    const accessibilityInfo = LocalStorageService.get("user_accessibility");
    if (userInfo) {
      setUser(userInfo);
      setAccessibility(accessibilityInfo);
    }
    if (!userInfo || !token) {
      router.push("/login");
    }
  }, [currentUrl]);

  if (currentUrl != "/login" && !user && !accessibility) {
    return null;
  }

  if (currentUrl != "/login") {
    return (
      <CompanyProvider>
        <VendorsProvider>
          <ManufacturerProvider>
            <SalesPersonProvider>
              <ProductProvider>
                <StateCityProvider>
                  <ProjectProvider>
                    <main className="relative flex h-screen overflow-hidden gap-4 bg-zinc-100">
                      <div className="hidden md:flex md:flex-col h-full overflow-y-auto bg-charlestongreen">
                        <Sidebar user={user} accessibility={accessibility} />
                      </div>

                      {/* MAIN CONTENT */}

                      <section className="grow basis-[85%] overflow-y-auto rounded-2xl px-4 md:px-8 py-5 flex flex-col gap-5 print:h-fit">
                        <div className="flex items-center gap-4 md:hidden">
                          <Sheet>
                            <SheetTrigger></SheetTrigger>
                            <SheetContent>
                              <Sidebar
                                user={user}
                                accessibility={accessibility}
                              />
                            </SheetContent>
                          </Sheet>
                          <Image
                            src="https://solarsure.in/wp-content/uploads/2025/08/cropped-Landscape_Logo-scaled-1-203x33.png"
                            width={203}
                            height={33}
                            alt="solar sure logo"
                            className="custom-logo"
                          />
                        </div>
                        {/* <Header /> */}
                        {/* <div className="h-[1px] bg-zinc-300" /> */}
                        {children}
                      </section>
                    </main>
                  </ProjectProvider>
                </StateCityProvider>
              </ProductProvider>
            </SalesPersonProvider>
          </ManufacturerProvider>
        </VendorsProvider>
      </CompanyProvider>
    );
  } else {
    return <main>{children}</main>;
  }
}

export default Layout;
