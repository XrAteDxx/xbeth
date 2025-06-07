function sidebarInit() {
    const burger = document.getElementById('burger');
    const sidebar = document.getElementById('sidebar');
    const body = document.body;

    function isMobile() {
        return window.matchMedia('(max-width: 700px)').matches;
    }

    if (burger && sidebar) {
        burger.addEventListener('click', function (e) {
            e.stopPropagation();
            if (isMobile()) {
                sidebar.classList.toggle('active');
                body.classList.toggle('sidebar-open', sidebar.classList.contains('active'));
            } else {
                sidebar.classList.toggle('collapsed');
            }
        });

        // On mobile, clicking outside the sidebar closes it
        document.addEventListener('click', function (e) {
            if (isMobile() && sidebar.classList.contains('active')) {
                if (!sidebar.contains(e.target) && !burger.contains(e.target)) {
                    sidebar.classList.remove('active');
                    body.classList.remove('sidebar-open');
                }
            }
        });

        // Remove mobile sidebar state if resizing to desktop
        window.addEventListener('resize', function () {
            if (!isMobile()) {
                sidebar.classList.remove('active');
                body.classList.remove('sidebar-open');
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', sidebarInit);