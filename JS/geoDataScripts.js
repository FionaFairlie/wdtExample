// Ready Scripts on page load
$( document ).ready(function() {

//Create Global Variables to handle mspData
var Postcode = "";
var constituencyName = "";
var constituencyID = "";
var personID = "";
var mspName = "";
var photoURL = "";
var partyID = "";
var partyName = "";
var mspEmail = "";

/*---------- INPUT HANDLING FUNCTIONS ----------*/

// On Button Press validate input and call main functions
$("#btn").on("click", function geoDataSearch() {
	// Change cursor style to "loading"
	$("body").css("cursor", "progress");
	$(":button").css("cursor", "progress");

	// Get Postcode value from <input> & validate user input
	Postcode = document.getElementById("postcode").value;
	if (Postcode == "") {
		document.getElementById("postcode").placeholder = "Invalid Postcode";
		$("body").css("cursor", "default");
		$(":button").css("cursor", "pointer");
	}
	else {
		// Reset Styles for new input
		document.getElementById("postcode").placeholder = "Postcode";
		document.getElementById("divJobBreakdown").style.display = "flex";
		document.getElementById("divJobBreakdown").style.height = "150px";
		document.getElementById("divJobBreakdown").style.width = "100%";
		$("#divMspContent").empty();
		$("#divMspContent").append(document.createElement("h1"));
		$("#divMspContent h1")[0].innerHTML = "MSP Details";
		$("#divJobBreakdown").empty();
		$("#divJobBreakdown").append(document.createElement("h1"));
		$("#divJobBreakdown h1")[0].innerHTML = "Job Breakdown";
		$("body #viewMoreButton").remove();
		
		// Concat URL variables for Ajax
		var mspURL = "https://api.postcodes.io/scotland/postcodes/".concat(Postcode);
		var pcURL = "http://api.lmiforall.org.uk/api/v1/census/jobs_breakdown?area=".concat(Postcode);
		
		getConstituencyName(mspURL);
		getJobBreakdown(pcURL);
		
	}
})

// Ajax function - Get Constituency Name, call next function
function getConstituencyName(mspURL) {
	$.ajax({
		url: mspURL,
		type: "get",
		dataType: "json",
		success: function(data) {
			constituencyName = data.result.scottish_parliamentary_constituency;
			getConsituencyID(constituencyName);
		}
	});
}

// Ajax function - Get Constituency ID, call next function
function getConsituencyID(constituencyName) {
	$.ajax({
		url: "https://data.parliament.scot/api/constituencies",
		type: "get",
		dataType: "json",
		success: function(data) {
			for(i = 0; i<data.length; i++) {
				if (constituencyName == data[i].Name && data[i].ValidFromDate == "2011-05-04T00:00:00") {
					constituencyID = data[i].ID;
				}
			}
			getPersonID(constituencyID);
		}
	});
}

// Ajax function - Get PersonID, call next function
function getPersonID(constituencyID) {
	$.ajax({
		url: "https://data.parliament.scot/api/MemberElectionConstituencyStatuses",
		type: "get",
		dataType: "json",
		success: function(data) {
			for(i = 0; i<data.length; i++) {
				if (constituencyID == data[i].ConstituencyID) {
					personID = data[i].PersonID;
				}
			}
			getMemberDetails(personID);
		}
	});
}

// Ajax function - Get MSPDetails, call next function
function getMemberDetails(personID) {
	$.ajax({
		url: "https://data.parliament.scot/api/members",
		type: "get",
		dataType: "json",
		success: function(data) {
			for(i = 0; i<data.length; i++) {
				if (personID == data[i].PersonID) {
					mspName = data[i].ParliamentaryName;
					photoURL = data[i].PhotoURL;
				}
			}
			getMemberParty(personID);
		}
	});
}

// Ajax function - Get PartyID, call next function
function getMemberParty(personID) {
	$.ajax({
		url: "https://data.parliament.scot/api/memberparties",
		type: "get",
		dataType: "json",
		success: function(data) {
			for(i = 0; i<data.length; i++) {
				if (personID == data[i].PersonID) {
					partyID = data[i].PartyID;
				}
			}
			getPartyName(partyID);
		}
	});
}

// Ajax function - Get Party Name, call next function
function getPartyName(partyID) {
	$.ajax({
		url: "https://data.parliament.scot/api/parties",
		type: "get",
		dataType: "json",
		success: function(data) {
			for(i = 0; i<data.length; i++) {
				if (partyID == data[i].ID) {
					partyName = data[i].ActualName;
				}
			}
			getMemberEmail();
		}
	});
}

// Ajax function - Get MSP Email if available, call next function
function getMemberEmail() {
	$.ajax({
		url: "https://data.parliament.scot/api/emailaddresses",
		type: "get",
		dataType: "json",
		success: function(data) {
			for(i = 0; i<data.length; i++) {
				if (personID == data[i].PersonID && data[i].Address != "") {
					mspEmail = data[i].Address;
				}
			}
			// Assign value if no valid email was found, then call print method
			if (mspEmail == "") {
				mspEmail = "No Email Found";
				printMspDetails(mspEmail);
			}
			else {
				printMspDetails();
			}
		}
	});
}

// Ajax function - Refresh div, create and append relevant MSPDetails to div
function printMspDetails() {
	
	$("#divMspContent").empty();
	
	// Create elements to store msp details
	var divMspDetails = document.createElement("div");
	var br1 = document.createElement("br");
	var h1 = document.createElement("h1");
	var dl = document.createElement("dl");
	var br2 = document.createElement("br");
	var dt1 = document.createElement("dt");
	var br3 = document.createElement("br");
	var dt2 = document.createElement("dt");
	var dt3 = document.createElement("dt");
	var img = document.createElement("img");
	
	// Format MSP Name ( Name, Example => Example Name )
	var nameArray = mspName.split(",");
	mspName = nameArray[1] + " " + nameArray[0];
	
	// Assign element attributes
	divMspDetails.id = "divMspDetails";
	h1.innerHTML = mspName;
	dt1.innerHTML = "Constituency: " + constituencyName;
	dt2.innerHTML = "Party: " + partyName;
	dt3.innerHTML = "Email: " + mspEmail;
	img.id = "mspPhoto";
	img.src = photoURL;
	
	
	// Append elements to webpage divs
	$("#divMspContent").append(divMspDetails);
	
	$("#divMspDetails").append(br1);
	$("#divMspDetails").append(h1);
	
	$("#divMspDetails").append(dl);
	$("#divMspDetails dl").append(dt1);
	
	$("#divMspDetails dl").append(br2);
	$("#divMspDetails dl").append(dt2);
	
	$("#divMspDetails dl").append(br3);
	$("#divMspDetails dl").append(dt3);
	
	$("#divMspContent").append(img);
	
	// Return cursor to default
	$("body").css("cursor", "default");
	$(":button").css("cursor", "pointer");
}



//-------- JOB BREAKDOWN FUNCTIONS --------//

// Display top 10 most popular jobs in chart
function getJobBreakdown(pcURL) {
	$("body").css("cursor", "progress");
	$(":button").css("cursor", "progress");
	
	$.ajax({
	url: pcURL,
	type: "get",
	dataType: "json",
	success: function(data) {
		
		// If statement to decide font size (for mobile resolution)
		var fontSize;
		if (window.innerWidth < 769) { fontSize = 12; } else { fontSize = 20; }
		
		// Create chart to store Job Breakdown details
		var chart = new CanvasJS.Chart("divJobBreakdown", {
			animationEnabled: false,
			title:{
				text:"Job Breakdown for " + document.getElementById("postcode").value,
				fontFamily: "ClearSans-Medium",
				fontSize: 30,
				padding: 20,
			},
			axisX:{
				reversed: true,
				interval: 1,
				labelFontFamily: "ClearSans-Light",
				labelFontSize: fontSize
			},
			axisY2:{
				interval: 5,
				labelFontFamily: "ClearSans-Regular",
				labelFontSize: 16
			},
			data: [{
				type: "bar",
				axisYType: "secondary",
				color: "#004786",
				dataPoints: []
			}]
		});
			
			// Counter to determine <div> height
			var heightCount = 0;
			
			// Loop through first 10 items in API
			for(i = 0; i<10; i++){
				// Since I only want categories that have workers. Set a breakpoint to check percentage (>0%) OR value (>1)
				if (data.jobsBreakdown[i].percentage > 0 && data.jobsBreakdown[i].description != "Not available") {
					// Create variable to store % number rounded to 3 decimals
					var roundedPercent = Number(data.jobsBreakdown[i].percentage.toFixed(3));
					
					// Push data onto chart
					chart.options.data[0].dataPoints.push({y: roundedPercent, label: ''.concat(data.jobsBreakdown[i].description).concat('')});
					
					// Increment Coutner
					heightCount = heightCount + 1;
				}
			}
			
			// Apply div styles to hold Chart & render chart
			document.getElementById("divJobBreakdown").style.display = "inline-block";
			document.getElementById("divJobBreakdown").style.height = heightCount * 100 + "px";
			document.getElementById("divJobBreakdown").style.width = "100%";
			chart.render();
			
			// Create and append "View More" button
			$("body #viewMoreButton").remove();
			var vmButton = document.createElement("button");
			vmButton.id = "viewMoreButton";
			vmButton.innerHTML = "View More";
			vmButton.onclick = function() { viewMore(); } 
			$("body").append(vmButton);
			
			$("body").css("cursor", "default");
			$(":button").css("cursor", "pointer");
		},
	// If Job Breakdown Ajax response fails : Show error message
	error: function() {
		document.getElementById("postcode").value = "";
		document.getElementById("postcode").placeholder = "Invalid Postcode";
		$("body").css("cursor", "default");
		$(":button").css("cursor", "pointer");
	}
	});
}


// Replace graph with table, displaying all data from API response in table
function viewMore() {
	$("body").css("cursor", "progress");
	$(":button").css("cursor", "progress");
	
	// Use default div styles
	document.getElementById("divJobBreakdown").style.display = "flex";
	document.getElementById("divJobBreakdown").style.height = "150px";
	document.getElementById("divJobBreakdown").style.width = "100%";
	$("#divJobBreakdown").empty();
	$("#divJobBreakdown").append(document.createElement("h1"));
	$("#divJobBreakdown h1")[0].innerHTML = "Processing";
	
	var pcURL = "http://api.lmiforall.org.uk/api/v1/census/jobs_breakdown?area=".concat(Postcode);
	
	$.ajax({
	url: pcURL,
	type: "get",
	dataType: "json",
	success: function(data) {
		
		// Create table & header row
		var table = document.createElement("Table");
		var newRow = table.insertRow(table.rows.lgenth);
			
			var cel1 = newRow.insertCell(0);
			var cel2 = newRow.insertCell(1);
			var cel3 = newRow.insertCell(2);
			var cel4 = newRow.insertCell(3);
			var cel5 = newRow.insertCell(4);
			
			cel1.innerHTML = "#";
			cel2.innerHTML = "SoC";
			cel3.innerHTML = "Description";
			cel4.innerHTML = "Jobs";
			cel5.innerHTML = "%"
			
		for(i = 0; i<data.jobsBreakdown.length; i++){
			// Since I only want categories that have workers. Set a breakpoint to check percentage (>0%) OR value (>1)
			if (data.jobsBreakdown[i].percentage > 0 && data.jobsBreakdown[i].description != "Not available") {
				var newRow = table.insertRow(table.rows.lgenth);
				var cel1 = newRow.insertCell(0);
				var cel2 = newRow.insertCell(1);
				var cel3 = newRow.insertCell(2);
				var cel4 = newRow.insertCell(3);
				var cel5 = newRow.insertCell(4);
				
				cel1.innerHTML = i;
				cel2.innerHTML = data.jobsBreakdown[i].socGroup;
				cel3.innerHTML = data.jobsBreakdown[i].description;
				cel4.innerHTML = data.jobsBreakdown[i].value;
				cel5.innerHTML = data.jobsBreakdown[i].percentage.toFixed(3);
			}
		}
		document.getElementById("divJobBreakdown").style.display = "block";
		document.getElementById("divJobBreakdown").style.height = "100%";
		document.getElementById("divJobBreakdown").appendChild(table);
		
		// Create and append "View Less" button (to return to graph)
		$("#divJobBreakdown h1")[0].remove();
		$("body #viewMoreButton").remove();
		var vmButton = document.createElement("button");
		vmButton.id = "viewMoreButton";
		vmButton.innerHTML = "View Less";
		vmButton.onclick = function() { viewLess(); } 
		$("body").append(vmButton);
		
		$("body").css("cursor", "default");
		$(":button").css("cursor", "pointer");
	}
	});
}

// Set Postcode URL and call getJobBreakdown function to re-render graph;
function viewLess() {
	var pcURL = "http://api.lmiforall.org.uk/api/v1/census/jobs_breakdown?area=".concat(Postcode);
	
	getJobBreakdown(pcURL);
}

});