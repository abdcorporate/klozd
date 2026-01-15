import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 md:gap-16">
          <div className="col-span-2 md:col-span-1">
            <h3 className="font-bold text-xl text-slate-900 mb-4">KLOZD</h3>
            <p className="text-sm text-slate-600 leading-relaxed max-w-xs">
              La plateforme complète pour infopreneurs et équipes de closing.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-slate-900 mb-5">Produit</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <a
                  href="#features"
                  className="text-slate-600 hover:text-slate-900 transition-colors duration-200"
                >
                  Features
                </a>
              </li>
              <li>
                <a
                  href="#how-it-works"
                  className="text-slate-600 hover:text-slate-900 transition-colors duration-200"
                >
                  How it works
                </a>
              </li>
              <li>
                <a
                  href="#security"
                  className="text-slate-600 hover:text-slate-900 transition-colors duration-200"
                >
                  Security
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-slate-900 mb-5">Légal</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  href="/privacy"
                  className="text-slate-600 hover:text-slate-900 transition-colors duration-200"
                >
                  Privacy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-slate-600 hover:text-slate-900 transition-colors duration-200"
                >
                  Terms
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-slate-900 mb-5">Contact</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <a
                  href="/waitlist"
                  className="text-slate-600 hover:text-slate-900 transition-colors duration-200"
                >
                  Join waitlist
                </a>
              </li>
              <li>
                <a
                  href="https://my.klozd.com/login"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-600 hover:text-slate-900 transition-colors duration-200"
                >
                  Sign in
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-slate-200/80 text-center">
          <p className="text-sm text-slate-600">
            &copy; {new Date().getFullYear()} KLOZD. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  );
}
