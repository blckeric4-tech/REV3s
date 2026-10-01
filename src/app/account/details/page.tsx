import { db } from "@/lib/prisma";
import { requireCustomer } from "@/lib/customer-auth";
import { customerSignOut, customerUpdateName } from "@/app/account/actions";
import { AccountShell } from "../account-shell";
import { AccountNameForm } from "@/components/account/account-name-form";
import { AvatarForm } from "@/components/account/avatar-form";

export const metadata = { title: "Account details" };
export const dynamic = "force-dynamic";

export default async function AccountDetailsPage() {
  const customer = await requireCustomer("/account/details");

  const [account, orderCount] = await Promise.all([
    db.customer.findUniqueOrThrow({
      where: { id: customer.id },
      select: { createdAt: true, updatedAt: true, avatarUrl: true },
    }),
    db.order.count({ where: { customerId: customer.id } }),
  ]);

  const dateFmt = (d: Date) =>
    new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

  return (
    <AccountShell customer={customer} memberSince={account.createdAt} active="details">
      <div className="grid max-w-3xl gap-6 lg:grid-cols-[1fr_18rem]">
        <div className="space-y-6">
          <section id="photo" className="card scroll-mt-28 p-6">
            <h2 className="font-display text-lg uppercase">Profile photo</h2>
            <p className="mt-2 text-sm leading-relaxed text-fg/70">
              Shown next to your name in the header and on your account.
            </p>
            <div className="mt-6">
              <AvatarForm name={customer.name} currentAvatar={account.avatarUrl} />
            </div>
          </section>

          <section className="card p-6">
            <h2 className="font-display text-lg uppercase">Personal details</h2>
            <p className="mt-2 text-sm leading-relaxed text-fg/70">
              The name you set here is the name we print on your order and delivery label.
            </p>
            <div className="mt-6">
              <AccountNameForm action={customerUpdateName} currentName={customer.name} />
            </div>
          </section>

          <section className="card p-6">
            <h2 className="font-display text-lg uppercase">Sign-in</h2>
            <dl className="mt-5 space-y-4 text-sm">
              <div>
                <dt className="label-xs text-haze">Email address</dt>
                <dd className="mt-1.5 break-all font-semibold">{customer.email}</dd>
                <p className="mt-1.5 text-xs leading-relaxed text-fg/70">
                  This is your sign-in name. Password resets are not available yet — contact us if
                  you need the email changed.
                </p>
              </div>
            </dl>
          </section>
        </div>

        <aside className="space-y-6">
          <section className="card p-5">
            <h2 className="label-xs text-haze">Account</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-fg/70">Member since</dt>
                <dd className="font-semibold">{dateFmt(account.createdAt)}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-fg/70">Orders</dt>
                <dd className="font-semibold">{orderCount}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-fg/70">Last updated</dt>
                <dd className="font-semibold">{dateFmt(account.updatedAt)}</dd>
              </div>
            </dl>
          </section>

          <section className="card p-5">
            <h2 className="label-xs text-haze">Session</h2>
            <p className="mt-3 text-xs leading-relaxed text-fg/70">
              Signing out ends this session on this device only.
            </p>
            <form action={customerSignOut} className="mt-4">
              <button type="submit" className="btn btn-ghost w-full">
                Sign out
              </button>
            </form>
          </section>
        </aside>
      </div>
    </AccountShell>
  );
}