// Ready Scripts on page load
$( document ).ready(function() {

// Create global chart variable
var chart;

/*---------- INPUT HANDLING FUNCTIONS ----------*/

// On Button Press validate input and call main functions
$("#btn").on("click", function occupationRatesSearch() {
	$("body").css("cursor", "progress");
	$(":button").css("cursor", "progress");
	
	// Validate Occupation value from <input>
	var occupation = document.getElementById("occupation");
	if (occupation.value == "") {
		occupation.placeholder = "Invalid Occupation"
		$("body").css("cursor", "default");
		$(":button").css("cursor", "pointer");
	}
	else {
		// Reset Styles for new input
		$("body p").remove();
		occupation.placeholder = "Occupation";
		$("#divOccupationPayRate").empty();
		document.getElementById("divOccupationPayRate").style.display = "block";
		document.getElementById("divOccupationPayRate").style.height = "100%";
		$("#divOccupationPayRate").append(document.createElement("h1"));
		$("#divOccupationPayRate h1")[0].innerHTML = "Processing...";
		
		// Concat URL variables for Ajax
		var occupationURL = " http://api.lmiforall.org.uk/api/v1/soc/search?q=".concat(occupation.value);
		
		// Start Main Function
		getOccupationList(occupation, occupationURL);
	}
});

// Using input occupation, search API, check for value with matching substring, display all matches and table filter
// No API result = Display "No results from API" message
// 1 API result = Automatically run charting function
// > 1 results = Display results in a table, allowing user to select occupation
// > 1 results (No substring matches) = Display alert & "best guess" results
function getOccupationList(occupation, occupationURL) {
	$.ajax({
		url: occupationURL,
		type: "get",
		dataType: "json",
		success: function(data) {
			$("#divSelectionTable").empty();
			document.getElementById("divSelectionTable").style.display = "block";
			
			// Create and append filter input
			var tableFilter = document.createElement("Input");
			tableFilter.type = "text";
			tableFilter.id = "inputTableFilter";
			tableFilter.onkeyup = function() { filterTable(); } 
			tableFilter.placeholder = "Search for Occupation...";
			
			// Create Table and set Id
			var table = document.createElement("Table");
			table.id = "tableOccupations";
			
			// Create Ttble header row
			var newRow = document.createElement("Tr");
			var cel1 = document.createElement("Th");
			var cel2 = document.createElement("Th");
			cel1.innerHTML = "SoC";
			cel2.innerHTML = "Select Occupation"
			
			// Append header row to table
			newRow.appendChild(cel1);
			newRow.appendChild(cel2);
			table.appendChild(newRow);
			
			// Check the Ajax response has data (atleast 1 value);
			if (!$.trim(data) == true) {
				// Display error message (reset div styles)
				var errorMsg = document.createElement("h1");
				errorMsg.innerHTML = "No results from API";
				errorMsg.style.color = "white";
				document.getElementById("divSelectionTable").appendChild(errorMsg);
				document.getElementById("divOccupationPayRate").style.display = "none";
				$("body").css("cursor", "default");
				$(":button").css("cursor", "pointer");
			}
			else {
				
				// If statement used, if there is only 1 result, use that soc code and get year data, else, provide a list in table format for the user to choose from
				
				// If only 1 result from API automatically run getYearData
				if (data.length == 1) {
					var id = document.createElement("a");
					id.id = data[0].soc;
					id.text = data[0].title;
					getYearData(id);
				}
				else {
					
					// Lowercase user input to prepare for comparisons
					var occupationMatch = occupation.value.toLowerCase();
					
					// Start for loop to treverse API
					for(i = 0; i<data.length; i++) {

						// Get occupation title from API and made lowercase for comparison
						occupationTitle = data[i].title.toLowerCase();
						
						// Check if the occupation input is a substring of the API occupation title
						if ((occupationTitle.indexOf(occupationMatch) !== -1) == true) {
							
							// Create new row for occupation
							var newRow = table.insertRow(table.rows.lgenth);
							var cel1 = newRow.insertCell(0);
							var cel2 = newRow.insertCell(1);
							cel1.innerHTML = data[i].soc;
							cel2.innerHTML = "<a id=" + data[i].soc + "> " + data[i].title + "</a>";
						}
					}
					// If table variable still only has 1 row, then there are no substring matches: Display alert and use "best guesses"
					if(table.children.length == 1) {
						// Display alert above divSelectionTable
						document.getElementById("divSelectionTable").insertAdjacentHTML ("beforebegin", "<p>No Matching Occupations</p><p>(TIP: If possible try without suffix: Developer => Develop)</p><p>Here are our best guesses!</p>");
						
						// Loop through the API results and print them
						for(i = 0; i<data.length; i++) {
							var newRow = table.insertRow(table.rows.lgenth);
							var cel1 = newRow.insertCell(0);
							var cel2 = newRow.insertCell(1);
							cel1.innerHTML = data[i].soc;
							cel2.innerHTML = "<a id=" + data[i].soc + "> " + data[i].title + "</a>";
						}
					}
					// Append tableFilter and table onto div
					document.getElementById("divSelectionTable").appendChild(tableFilter);
					document.getElementById("divSelectionTable").appendChild(table);
					$("#divOccupationPayRate h1")[0].innerHTML = "Estimated Rate of Pay";
					
					/*  Apply onclick function to new <a> tags
						This is due to previously calling data.length == 1, therefore, that function requires access to openly call getYearData(id) as well as new <a>
						
						NOTE : This can also be solved by removing $( document ).ready    This is because $("td a").on("click"...) only applies to
							   <a> existing on document load, but in this case, the site generates the <a>, thus, the onclick needs to be applied after generation
							   
						IMPORTANT : THIS DOES NOT WORK ON CHROME (Need more time to find fix)  */
					$("td a").on("click", function getYearDataFromTable(id) {
						var selectedOccupation = id.originalEvent.originalTarget;
						getYearData(selectedOccupation);
					});
				}
				$("body").css("cursor", "default");
				$(":button").css("cursor", "pointer");
			}
		}
	});
}

// Allow the user to filter results using live updating search field
function filterTable() {
	//Code from: https://www.w3schools.com/howto/howto_js_filter_table.asp
	
	// Declare variables
	var input, filter, table, tr, td, i, txtValue;
	input = document.getElementById("inputTableFilter");
	filter = input.value.toUpperCase();
	table = document.getElementById("tableOccupations");
	tr = table.getElementsByTagName("tr");

	// Loop through all table rows, and hide those who don't match the search query
	for (i = 0; i < tr.length; i++) {
		td = tr[i].getElementsByTagName("td")[1];
		if (td) {
			txtValue = td.textContent || td.innerText;
			if (txtValue.toUpperCase().indexOf(filter) > -1) {
				tr[i].style.display = "";
			} else {
				tr[i].style.display = "none";
			}
		}
	}
}



/*---------- CHART FUNCTIONS ----------*/

// Function utlised by rendered chart to enable / disable dataset on legend click
function toggleDataSeries(e) {
	if (typeof (e.dataSeries.visible) === "undefined" || e.dataSeries.visible) {
		e.dataSeries.visible = false;
	}
	else {
		e.dataSeries.visible = true;
	}
	chart.render();
}


// After user has selected occupation begin creating line chart using 4 regions (datasets)
function getYearData(selectedOccupation) {
	$("body").css("cursor", "progress");
	$(":button").css("cursor", "progress");
	
	// Remove selectTable
	document.getElementById("divSelectionTable").style.display = "none";
	
	// Get data from selected occupation
	var occupationId = selectedOccupation.id;
	var occupationTitle = selectedOccupation.text;
	
	// Create empty line chart
	chart = new CanvasJS.Chart("divOccupationPayRate", {
		animationEnabled: true,
		theme: "light2",
		title:{
			text: "Estimated Rate of Pay for " + occupationTitle + " in the UK",
		},
		legend: {
			cursor:"pointer",
			itemclick: toggleDataSeries
		},
		toolTip:{
			fontFamily: "Calibri",
			fontSize: "20",
			contentFormatter: function ( e ) {
               return e.entries[0].dataSeries.name + ", " + e.entries[0].dataPoint.x + ":  £" + e.entries[0].dataPoint.y;  
			}  
		},
		axisX: {
			title: "Year",
			valueFormatString: "#",
			interval: 1,
		},
		axisY:{
			title: "Weekly Pay (£)",
			includeZero: false,
		},
		data: []
	});
	
	// Call Ireland Method
	getIrelandData(chart, occupationId);
}

// Ajax Function - Filter region to Ireland, push dataset chart
function getIrelandData(chart, occupationId) {
	var yearDataUrl = "http://api.lmiforall.org.uk/api/v1/ashe/estimatePay?soc=" + occupationId + "&coarse=true&filters=region%3A12";
	$.ajax({
		url: yearDataUrl,
		type: "get",
		dataType: "json",
		success: function(data) {
			
			// Sort API data by year (From '13 > '17 > '15 to '13 > '15 > '17)
			var sortedYears = data.series.sort(function(y1, y2) {
				if (y1.year > y2.year) {
					return 1;
				} else {
					return -1;
				}
			});
			
			// Create new dataset, apply type, colour, show in legend and create empty dataPoints
			chart.options.data.push({ type:"line", color: "#076543", showInLegend: true, dataPoints: [] });
			
			// Traverse API data and populate dataset
			for(i = 0; i<data.series.length; i++) {
				var year = data.series[i].year;
				var estpay = data.series[i].estpay;
				
				chart.options.data[0].dataPoints.push({ x: year, y : estpay });
			}
			// Set dataset name
			chart.options.data[0].name = "Ireland";
			
			// Call next region function
			getLondonData(chart, occupationId);
		}
	});
}

// Ajax Function - Filter region to Lodon, push dataset chart - Functions the same as commented : getIrelandData(chart, occupationId);
function getLondonData(chart, occupationId) {
	var yearDataUrl = "http://api.lmiforall.org.uk/api/v1/ashe/estimatePay?soc=" + occupationId + "&coarse=true&filters=region%3A1";
	$.ajax({
		url: yearDataUrl,
		type: "get",
		dataType: "json",
		success: function(data) {
			
			var sortedYears = data.series.sort(function(y1, y2) {
				if (y1.year > y2.year) {
					return 1;
				} else {
					return -1;
				}
			});
			
			chart.options.data.push({ type:"line", color: "#cf081f",showInLegend: true, dataPoints: [] });
			
			for(i = 0; i<data.series.length; i++) {
				var year = data.series[i].year;
				var estpay = data.series[i].estpay;
				
				chart.options.data[1].dataPoints.push({ x: year, y : estpay });
			}
			chart.options.data[1].name = "London"
			getScotlandData(chart, occupationId);
		}
	});
}

// Ajax Function - Filter region to Ireland, push dataset chart - Functions the same as commented : getIrelandData(chart, occupationId);
function getScotlandData(chart, occupationId) {
	var yearDataUrl = "http://api.lmiforall.org.uk/api/v1/ashe/estimatePay?soc=" + occupationId + "&coarse=true&filters=region%3A11";
	$.ajax({
		url: yearDataUrl,
		type: "get",
		dataType: "json",
		success: function(data) {
			
			var sortedYears = data.series.sort(function(y1, y2) {
				if (y1.year > y2.year) {
					return 1;
				} else {
					return -1;
				}
			});
			
			chart.options.data.push({ type:"line", color: "#0065be", showInLegend: true, dataPoints: [] });
			
			for(i = 0; i<data.series.length; i++) {
				var year = data.series[i].year;
				var estpay = data.series[i].estpay;
				
				chart.options.data[2].dataPoints.push({ x: year, y : estpay });
			}
			chart.options.data[2].name = "Scotland";
			getWhalesData(chart, occupationId);
		}
	});
}

// Ajax Function - Filter region to Ireland, push dataset chart
function getWhalesData(chart, occupationId) {
	var yearDataUrl = "http://api.lmiforall.org.uk/api/v1/ashe/estimatePay?soc=" + occupationId + "&coarse=true&filters=region%3A10";
	$.ajax({
		url: yearDataUrl,
		type: "get",
		dataType: "json",
		success: function(data) {
			
			var sortedYears = data.series.sort(function(y1, y2) {
				if (y1.year > y2.year) {
					return 1;
				} else {
					return -1;
				}
			});
			
			chart.options.data.push({ type:"line", color: "#f2a14c", showInLegend: true, dataPoints: [] });
			for(i = 0; i<data.series.length; i++) {
				var year = data.series[i].year;
				var estpay = data.series[i].estpay;
				
				chart.options.data[3].dataPoints.push({ x: year, y : estpay });
			}
			chart.options.data[3].name = "Whales";
			
			// Create variable to hold div
			var divOPR = document.getElementById("divOccupationPayRate")
			
			// Hide div > render chart > set div to chart height > show div
			divOPR.style.visibility = "hidden";
			chart.render();
			divOPR.style.height = document.getElementsByClassName("canvasjs-chart-canvas")[0].height + "px";
			divOPR.style.visibility = "visible";
			
			// Append tooltip for enabling / disabling datasets
			$("body").append("<p>Click Legend to toggle regions</p>");
			
			$("body").css("cursor", "default");
			$(":button").css("cursor", "pointer");
		}
	});
}

});