
function MainFunc() {


    var svgArea = d3.select("body").select("svg");
  
    if (!svgArea.empty()) {
      svgArea.remove();
    }

    var svgWidth = window.innerWidth;
    var svgHeight = window.innerHeight;

    var margin = {
        top: 150,
        bottom: 150,
        right: 150,
        left: 150
      };

    var width = svgWidth - margin.left - margin.right;
    var height = svgHeight - margin.top - margin.bottom;

    //append SVG group to contain chart,
    var svg = d3
    .select("#scatter")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

    var chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

    var chosenXAxis = "poverty";
    var chosenYAxis = "obesity";

// X Scale
  function xScale(journalismData, chosenXAxis) {
      // creating scales
      var xLinearScale = d3.scaleLinear()
        .domain([d3.min(journalismData, d => d[chosenXAxis])*0.8,
          d3.max(journalismData, d => d[chosenXAxis])*1.2
        ])
        .range([0, width]);
    
      return xLinearScale;
  }

  function renderAxes(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);
      
    xAxis.transition()
      .duration(1000)
      .call(bottomAxis);
      
    return xAxis;
  }
    
 
  
  // Y Scale
  function yScale(journalismData, chosenYAxis) {
    var yLinearScale = d3.scaleLinear()
      .domain([d3.min(journalismData, d => d[chosenYAxis])*0.8,
        d3.max(journalismData, d => d[chosenYAxis])*1.2
      ])
      .range([height, 0]);
  
    return yLinearScale;
  
  }

     
  function renderAxesY(newYScale, yAxis) {
    var leftAxis = d3.axisLeft(newYScale);
  
    yAxis.transition()
      .duration(1000)
      .call(leftAxis);
  
    return yAxis;
  }

  
  function renderCircles(circlesGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {
  
    circlesGroup.transition()
      .duration(500)
      .attr("cx", d => newXScale(d[chosenXAxis]))
      .attr("cy", d => newYScale(d[chosenYAxis]));

    return circlesGroup;
  }
  
  function renderLabels(cLabels, newXScale, chosenXAxis, newYScale, chosenYAxis) {

    cLabels.transition()
      .duration(500)
      .attr("x", d => newXScale(d[chosenXAxis]))
      .attr("y", d => newYScale(d[chosenYAxis]));
  
    return cLabels;
  }

  function updateToolTip(circlesGroup, chosenXAxis, chosenYAxis) {
  
    var label;
    var labelY;
    var suffix = "";

    
    if (chosenXAxis === "Poverty") {
      label = "Poverty: ";
      suffix = "%"
    }
    else if (chosenXAxis === "Income"){
        label = "Income: $ ";
    }
    else {
      label = "Age: ";
    }

    
    if (chosenYAxis === "Obesity") {
      labelY = "Obesity: ";
    }
    else if (chosenYAxis === "Smoke"){
        labelY = "Smoke: ";
    }
    else {
      labelY = "Healthcare Lack: ";
      
    }
    
    
    var toolTip = d3.tip()
      .attr("class", "d3-tip")
      .offset([50, -70])
      .html(function(d) {
        return (`${d.state}<br>${label} ${d[chosenXAxis]} ${suffix}<br>${labelY} ${d[chosenYAxis]} %`);
      });
  
    circlesGroup.call(toolTip);
  
    // Mouseover
    circlesGroup.on("mouseover", function(data) {
      toolTip.show(data);
    })
      .on("mouseout", function(data, index) {
        toolTip.hide(data);
      });
  
    return circlesGroup;
  }
  
  // Read CSV 
  d3.csv("assets/data/data.csv").then(function(journalismData, err) {
    if (err) throw err;
  
    
    journalismData.forEach(function(data) {
        data.poverty = +data.poverty;
        data.healthcare = +data.healthcare;
        data.age = +data.age;
        data.income = +data.income;
        data.obesity = +data.obesity;
        data.smokes = +data.smokes;
      
    });

  

    
    var xLinearScale = xScale(journalismData, chosenXAxis);
    var yLinearScale = yScale(journalismData, chosenYAxis);
  
  

    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);
  
   
    var xAxis = chartGroup.append("g")
      .classed("x-axis", true)
      .attr("transform", `translate(0, ${height})`)
      .call(bottomAxis);
  
    
    var yAxis = chartGroup.append("g")
      .classed("y-axis", true)
      .call(leftAxis);
  
    
    var gGroup = chartGroup.selectAll("g")
        .data(journalismData)
        .enter()
        .append("g")
        .classed("circles", true);

    var circlesGroup = gGroup.append("circle")
      .data(journalismData)
      .attr("cx", d => xLinearScale(d[chosenXAxis]))
      .attr("cy", d => yLinearScale(d[chosenYAxis]))
      .attr("r", 20)
      .classed("stateCircle", true)
      .attr("style","stroke:grey")
      .attr("opacity", ".5");
    

    var cLabels = chartGroup.selectAll(".circles")
      .append("text")
      .text(d => d.abbr)    
      .classed("stateText", true)
      .attr("alignment-baseline", "middle")
      .attr("font-size",".8em")
      .attr("x", d => xLinearScale(d[chosenXAxis]))  
      .attr("y", d => yLinearScale(d[chosenYAxis]));        
  
    
    var labelsGroup = chartGroup.append("g")
      .attr("transform", `translate(${width / 2}, ${height + 20})`);
  
    var povertyLabel = labelsGroup.append("text")
      .attr("x", 0)
      .attr("y", 20)
      .attr("value", "poverty") 
      .classed("active", true)
      .text("In Poverty (%)");
  
    var ageLabel = labelsGroup.append("text")
      .attr("x", 0)
      .attr("y", 40)
      .attr("value", "age") 
      .classed("inactive", true)
      .text("Age (Median)");

    var incomeLabel = labelsGroup.append("text")
      .attr("x", 0)
      .attr("y", 60)
      .attr("value", "income") 
      .classed("inactive", true)
      .text("Household Income (Median)");
  

    
    var labelsGroupY = chartGroup.append("g")
      .attr("transform", "rotate(-90)");
  
    var obesityLabel = labelsGroupY.append("text")
      .attr("x", 0 - (height / 2))
      .attr("y", -70)
      .attr("value", "obesity")
      .classed("active", true)
      .text("Obesity (%)");
  
    var smokesLabel = labelsGroupY.append("text")
      .attr("x", 0 - (height / 2))
      .attr("y", -50)
      .attr("value", "smokes") 
      .classed("inactive", true)
      .text("Smokes (%)");

    var healthcareLabel = labelsGroupY.append("text")
      .attr("x", 0 - (height / 2))
      .attr("y", -30)
      .attr("value", "healthcare") 
      .classed("inactive", true)
      .text("Lacks Healthcare (%)");
  
    
    var circlesGroup = updateToolTip(circlesGroup, chosenXAxis, chosenYAxis);
  
    
    labelsGroup.selectAll("text")
      .on("click", function() {
        
        var value = d3.select(this).attr("value");
        if (value !== chosenXAxis) {
  
         
          chosenXAxis = value;
  
          console.log(chosenXAxis)
  
          
          xLinearScale = xScale(journalismData, chosenXAxis);
  
       
          xAxis = renderAxes(xLinearScale, xAxis);
  
        
          circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis,  yLinearScale, chosenYAxis);
  
          
          circlesGroup = updateToolTip(circlesGroup, chosenXAxis, chosenYAxis);
          
          
          cLabels = renderLabels(cLabels, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

          
          if (chosenXAxis === "age") {
            ageLabel
              .classed("active", true)
              .classed("inactive", false);
            povertyLabel
              .classed("active", false)
              .classed("inactive", true);
            incomeLabel
              .classed("active", false)
              .classed("inactive", true);
          }
          else if (chosenXAxis === "income") {
            ageLabel
            .classed("active", false)
            .classed("inactive", true);
          povertyLabel
            .classed("active", false)
            .classed("inactive", true);
          incomeLabel
            .classed("active", true)
            .classed("inactive", false);          
          }
          else {
            ageLabel
              .classed("active", false)
              .classed("inactive", true);
            povertyLabel
              .classed("active", true)
              .classed("inactive", false);
            incomeLabel
              .classed("active", false)
              .classed("inactive", true);
          }
        }
      });

  
    labelsGroupY.selectAll("text")
    .on("click", function() {
      
      var valueY = d3.select(this).attr("value");
      if (valueY !== chosenYAxis) {

        
        chosenYAxis = valueY;

        console.log(chosenYAxis)

        
        yLinearScale = yScale(journalismData, chosenYAxis);

        
        yAxis = renderAxesY(yLinearScale, yAxis);

        
        circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis,  yLinearScale, chosenYAxis);

        
        circlesGroup = updateToolTip(circlesGroup, chosenXAxis, chosenYAxis);

      
        cLabels = renderLabels(cLabels, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
          
        
        if (chosenYAxis === "smokes") {
          smokesLabel
            .classed("active", true)
            .classed("inactive", false);
          healthcareLabel
            .classed("active", false)
            .classed("inactive", true);
          obesityLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else if (chosenYAxis === "healthcare") {
          smokesLabel
            .classed("active", false)
            .classed("inactive", true);
          healthcareLabel
            .classed("active", true)
            .classed("inactive", false);
          obesityLabel
            .classed("active", false)
            .classed("inactive", true);          
        }
        else {
          smokesLabel
            .classed("active", false)
            .classed("inactive", true);
          healthcareLabel
            .classed("active", false)
            .classed("inactive", true);
          obesityLabel
            .classed("active", true)
            .classed("inactive", false);
        }
      }
    });
  }).catch(function(error) {
    console.log(error);
  });


}


MainFunc();


d3.select(window).on("resize", MainFunc);

