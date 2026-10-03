import type { Metadata } from "next";
import { db } from "@/lib/prisma";
import { requireCustomer } from "@/lib/customer-auth";
import { customerSignOut, customerUpdateName } from "@/app/account/actions";
import { getTranslator } from "@/lib/i18n";
import { AccountShell } from "../account-shell";
import { AccountNameForm } from "@/components/account/account-name-form";
import { AvatarForm } from "@/components/account/avatar-form";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getTranslator();
  return { title: t("account.myDetails") };
}

export default async function AccountDetailsPage() {
  const [{ t, locale }, customer] = await Promise.all([
    getTranslator(),
    requireCustomer("/account/details"),
  ]);

  const [account, orderCount] = await Promise.all([
    db.customer.findUniqueOrThrow({
      where: { id: customer.id },
      select: { createdAt: true, updatedAt: true, avatarUrl: true },
    }),
    db.order.count({ where: { customerId: customer.id } }),
  ]);

  const dateFmt = (d: Date) =>
    new Date(d).toLocaleDateString(locale, { day: "2-digit", month: "short", year: "numeric" });

  return (
    <AccountShell customer={customer} memberSince={account.createdAt} active="details">
      <div className="grid max-w-3xl gap-6 lg:grid-cols-[1fr_18rem]">
        <div className="space-y-6">
          <section id="photo" className="card scroll-mt-28 p-6">
            <h2 className="font-display text-lg uppercase">{t("account.profilePhoto")}</h2>
            <p className="mt-2 text-sm leading-relaxed text-fg/70">
              {t("account.profilePhotoBody")}
            </p>
            <div className="mt-6">
              <AvatarForm
                name={customer.name}
                currentAvatar={account.avatarUrl}
                locale={locale}
              />
            </div>
          </section>

          <section className="card p-6">
            <h2 className="font-display text-lg uppercase">
              {t("account.personalDetails")}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-fg/70">
              {t("account.personalDetailsBody")}
            </p>
            <div className="mt-6">
              <AccountNameForm
                action={customerUpdateName}
                currentName={customer.name}
                locale={locale}
              />
            </div>
          </section>

          <section className="card p-6">
            <h2 className="font-display text-lg uppercase">{t("account.signInSection")}</h2>
            <dl className="mt-5 space-y-4 text-sm">
              <div>
                <dt className="label-xs text-haze">{t("account.emailAddress")}</dt>
                <dd className="mt-1.5 break-all font-semibold">{customer.email}</dd>
                <p className="mt-1.5 text-xs leading-relaxed text-fg/70">
                  {t("account.emailNote")}
                </p>
              </div>
            </dl>
          </section>
        </div>

        <aside className="space-y-6">
          <section className="card p-5">
            <h2 className="label-xs text-haze">{t("account.accountSection")}</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-fg/70">{t("account.memberSince")}</dt>
                <dd className="font-semibold">{dateFmt(account.createdAt)}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-fg/70">{t("account.totalOrders")}</dt>
                <dd className="font-semibold">{orderCount}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-fg/70">{t("account.lastUpdated")}</dt>
                <dd className="font-semibold">{dateFmt(account.updatedAt)}</dd>
              </div>
            </dl>
          </section>

          <section className="card p-5">
            <h2 className="label-xs text-haze">{t("account.session")}</h2>
            <p className="mt-3 text-xs leading-relaxed text-fg/70">
              {t("account.sessionBody")}
            </p>
            <form action={customerSignOut} className="mt-4">
              <button type="submit" className="btn btn-ghost w-full">
                {t("account.signOut")}
              </button>
            </form>
          </section>
        </aside>
      </div>
    </AccountShell>
  );
}