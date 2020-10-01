//--- RESPONSIVE NAVIGATION BAR HANDLING ---//

var navBarStatus = 0;

// Toggle Navbar expanded > collapsed
$("#btnMobileNav").on("click", function toggleNavBar() {
	var collapsedNav = document.getElementById("btnMobileNav");
	var expandedNav = document.getElementsByTagName("NAV");
	switch(navBarStatus) {
		case 0:
			collapsedNav.value = "✕";
			expandedNav[0].style.display = "initial";
			navBarStatus = 1;
			break;
		case 1:
			expandedNav[0].style.display = "none";
			collapsedNav.value = "☰";
			navBarStatus = 0;
			break;
	}
})


// On load or screen resize update navbar status
$(window).on("load resize",function(){
	var screenWidth = window.innerWidth;
	var collapsedNav = document.getElementById("btnMobileNav");
	var expandedNav = document.getElementsByTagName("NAV")[0];
	var activeLi = $("a.active");
	
	// If on mobile resolution collapse navbar & set active page highlight (border)
	if(screenWidth < 769) {
		expandedNav.style.display = "none";
		collapsedNav.value = "☰";
		navBarStatus = 0;
		activeLi[0].parentElement.style.borderLeft = "10px solid #0065be";
	}
	// Else expand navbar & remove page highlight
	else { expandedNav.style.display = "initial"; activeLi[0].parentElement.style.borderLeft = "none"; }
})