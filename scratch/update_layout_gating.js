import fs from 'fs';

const layoutPath = 'src/components/Layout.tsx';
let content = fs.readFileSync(layoutPath, 'utf8');

const startMarker = 'const renderNavLinks = () => (';
const endMarker = '    </nav>\n  );';

const startIndex = content.indexOf(startMarker);
const endIndex = content.indexOf(endMarker, startIndex) + endMarker.length;

if (startIndex === -1 || endIndex === -1) {
  console.error('Markers not found!');
  process.exit(1);
}

const replacement = `const renderNavLinks = () => {
    // 1. DEDICATED WORKSPACES PER ROLE
    if (userRole === 'Cashier') {
      return (
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          <div className="pt-2 pb-2 px-3">
            <span className="text-[10px] font-bold bg-teal-100 text-teal-800 px-2 py-0.5 rounded-full uppercase tracking-wider">
              Cashier Billing Station
            </span>
          </div>
          {commerceNavItems.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                "flex items-center px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                location.pathname === item.href 
                  ? "bg-teal-50 text-teal-700 font-semibold shadow-xs" 
                  : "text-gray-700 hover:bg-gray-100"
              )}
            >
              <item.icon className={cn("mr-3 h-5 w-5", location.pathname === item.href ? "text-teal-600" : "text-gray-400")} />
              {item.name}
            </Link>
          ))}
        </nav>
      );
    }

    if (userRole === 'Sales') {
      return (
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          <div className="pt-2 pb-2 px-3">
            <span className="text-[10px] font-bold bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full uppercase tracking-wider">
              Sales Rep Pipeline
            </span>
          </div>
          {crmNavItems.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                "flex items-center px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                location.pathname === item.href 
                  ? "bg-purple-50 text-purple-700 font-semibold shadow-xs" 
                  : "text-gray-700 hover:bg-gray-100"
              )}
            >
              <item.icon className={cn("mr-3 h-5 w-5", location.pathname === item.href ? "text-purple-600" : "text-gray-400")} />
              {item.name}
            </Link>
          ))}
        </nav>
      );
    }

    if (userRole === 'HR') {
      return (
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          <div className="pt-2 pb-2 px-3">
            <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full uppercase tracking-wider">
              HR & Workforce Portal
            </span>
          </div>
          {hrNavItems.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                "flex items-center px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                location.pathname === item.href 
                  ? "bg-blue-50 text-blue-700 font-semibold shadow-xs" 
                  : "text-gray-700 hover:bg-gray-100"
              )}
            >
              <item.icon className={cn("mr-3 h-5 w-5", location.pathname === item.href ? "text-blue-600" : "text-gray-400")} />
              {item.name}
            </Link>
          ))}
        </nav>
      );
    }

    if (userRole === 'Employee') {
      return (
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          <div className="pt-2 pb-2 px-3">
            <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full uppercase tracking-wider">
              My Employee Self-Service
            </span>
          </div>
          {dashboardNavItems.slice(0, 1).map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                "flex items-center px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                location.pathname === item.href 
                  ? "bg-amber-50 text-amber-700 font-semibold shadow-xs" 
                  : "text-gray-700 hover:bg-gray-100"
              )}
            >
              <item.icon className={cn("mr-3 h-5 w-5", location.pathname === item.href ? "text-amber-600" : "text-gray-400")} />
              {item.name}
            </Link>
          ))}
          <div className="pt-4 pb-1 px-3">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Workplace Tools</p>
          </div>
          {navItems.slice(0, 5).map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                "flex items-center px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                location.pathname === item.href 
                  ? "bg-blue-50 text-blue-700 font-semibold shadow-xs" 
                  : "text-gray-700 hover:bg-gray-100"
              )}
            >
              <item.icon className={cn("mr-3 h-5 w-5", location.pathname === item.href ? "text-blue-600" : "text-gray-400")} />
              {item.name}
            </Link>
          ))}
        </nav>
      );
    }

    // 2. COMPANY OWNER & ADMIN (SHOW ONLY PURCHASED MODULES)
    return (
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {isAdmin && (
          <div className="mb-3 pb-2 border-b border-gray-100">
            <Link
              to="/os/staff"
              className={cn(
                "flex items-center px-3 py-2.5 rounded-xl text-sm font-bold transition-all shadow-xs",
                location.pathname === '/os/staff'
                  ? "bg-purple-600 text-white shadow-purple-600/20"
                  : "bg-purple-50 text-purple-700 hover:bg-purple-100"
              )}
            >
              <Users className="mr-3 h-5 w-5" />
              <span>Staff & Team Access</span>
            </Link>
          </div>
        )}

        {navItems.map((item) => (
          <Link
            key={item.name}
            to={item.href}
            className={cn(
              "flex items-center px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
              location.pathname === item.href 
                ? "bg-blue-50 text-blue-700 font-semibold shadow-xs" 
                : "text-gray-700 hover:bg-gray-100"
            )}
          >
            <item.icon className={cn("mr-3 h-5 w-5", location.pathname === item.href ? "text-blue-600" : "text-gray-400")} />
            {item.name}
          </Link>
        ))}

        {/* TIER 1: FRONT OFFICE (CRM, SALES & SERVICE) - Gated by 'crm' */}
        {hasModule('crm') && (
          <>
            <div className="pt-4 pb-1">
              <div className="flex items-center justify-between px-3">
                <p className="text-xs font-bold text-purple-700 uppercase tracking-wider">Front Office (CRM & Sales)</p>
                {location.pathname.startsWith('/crm') && (
                  <span className="text-[9px] bg-purple-100 text-purple-800 font-extrabold px-1.5 py-0.5 rounded tracking-wider">ACTIVE</span>
                )}
              </div>
            </div>
            {crmNavItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "flex items-center px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                  location.pathname === item.href 
                    ? "bg-purple-50 text-purple-700 font-semibold shadow-xs" 
                    : "text-gray-700 hover:bg-gray-100"
                )}
              >
                <item.icon className={cn("mr-3 h-5 w-5", location.pathname === item.href ? "text-purple-600" : "text-gray-400")} />
                {item.name}
              </Link>
            ))}
          </>
        )}

        {/* TIER 2 & 3: OPERATIONS & FINANCE - Gated by 'erp' */}
        {hasModule('erp') && (
          <>
            <div className="pt-4 pb-1">
              <div className="flex items-center justify-between px-3">
                <p className="text-xs font-bold text-indigo-700 uppercase tracking-wider">Operations (Supply Chain)</p>
              </div>
            </div>
            {erpNavItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "flex items-center px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                  location.pathname === item.href 
                    ? "bg-indigo-50 text-indigo-700 font-semibold shadow-xs" 
                    : "text-gray-700 hover:bg-gray-100"
                )}
              >
                <item.icon className={cn("mr-3 h-5 w-5", location.pathname === item.href ? "text-indigo-600" : "text-gray-400")} />
                {item.name}
              </Link>
            ))}

            <div className="pt-4 pb-1">
              <div className="flex items-center justify-between px-3">
                <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Back Office & Finance</p>
              </div>
            </div>
            {financeNavItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "flex items-center px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                  location.pathname === item.href 
                    ? "bg-emerald-50 text-emerald-700 font-semibold shadow-xs" 
                    : "text-gray-700 hover:bg-gray-100"
                )}
              >
                <item.icon className={cn("mr-3 h-5 w-5", location.pathname === item.href ? "text-emerald-600" : "text-gray-400")} />
                {item.name}
              </Link>
            ))}
          </>
        )}

        {/* TIER 4: PEOPLE LAYER (HRM) - Gated by 'hem' */}
        {hasModule('hem') && (
          <>
            <div className="pt-4 pb-1">
              <div className="flex items-center justify-between px-3">
                <p className="text-xs font-bold text-blue-700 uppercase tracking-wider">People Layer (HRM)</p>
              </div>
            </div>
            {hrNavItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "flex items-center px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                  location.pathname === item.href 
                    ? "bg-blue-50 text-blue-700 font-semibold shadow-xs" 
                    : "text-gray-700 hover:bg-gray-100"
                )}
              >
                <item.icon className={cn("mr-3 h-5 w-5", location.pathname === item.href ? "text-blue-600" : "text-gray-400")} />
                {item.name}
              </Link>
            ))}
          </>
        )}

        {/* TIER 7: RETAIL & COMMERCE (POS) - Gated by 'pos' */}
        {hasModule('pos') && (
          <>
            <div className="pt-4 pb-1">
              <div className="flex items-center justify-between px-3">
                <p className="text-xs font-bold text-teal-700 uppercase tracking-wider">Retail & Commerce</p>
              </div>
            </div>
            {commerceNavItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "flex items-center px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                  location.pathname === item.href 
                    ? "bg-teal-50 text-teal-700 font-semibold shadow-xs" 
                    : "text-gray-700 hover:bg-gray-100"
                )}
              >
                <item.icon className={cn("mr-3 h-5 w-5", location.pathname === item.href ? "text-teal-600" : "text-gray-400")} />
                {item.name}
              </Link>
            ))}
          </>
        )}

        {/* ROLE PORTALS */}
        <div className="pt-4 pb-1">
          <div className="flex items-center justify-between px-3">
            <p className="text-xs font-bold text-amber-700 uppercase tracking-wider">Role Portals</p>
          </div>
        </div>
        {dashboardNavItems.map((item) => (
          <Link
            key={item.name}
            to={item.href}
            className={cn(
              "flex items-center px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
              location.pathname === item.href 
                ? "bg-amber-50 text-amber-700 font-semibold shadow-xs" 
                : "text-gray-700 hover:bg-gray-100"
            )}
          >
            <item.icon className={cn("mr-3 h-5 w-5", location.pathname === item.href ? "text-amber-600" : "text-gray-400")} />
            {item.name}
          </Link>
        ))}
      </nav>
    );
  };`;

const newContent = content.substring(0, startIndex) + replacement + content.substring(endIndex);
fs.writeFileSync(layoutPath, newContent, 'utf8');
console.log('Successfully updated Layout.tsx with Feature & Role Gating!');
