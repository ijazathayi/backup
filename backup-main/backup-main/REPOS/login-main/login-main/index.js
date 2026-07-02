function function2(){
    document.getElementById("cssstyle").style.display = 'none';
    document.getElementById("javascriptstyle").style.display = 'block';
}
function function1(){
    document.getElementById("cssstyle").style.display = 'block';
    document.getElementById("javascriptstyle").style.display = 'none';
}


function expandfunction(){
    document.getElementById("jbody").style.height = "110px";
    document.getElementById("jbody").style.display = "block";
    document.getElementById("out").style.width="330px";
    document.getElementById("inn").style.width="250px";
    document.getElementById("inn").style.height="300px";
    document.getElementById("out").style.height="400px";
}
function shrinkfunction(){
    document.getElementById("jbody").style.height = "0px";
    document.getElementById("jbody").style.display = "none";
    document.getElementById("out").style.width="300px";
    document.getElementById("inn").style.width="220px";
    document.getElementById("inn").style.height="120px";
    document.getElementById("out").style.height="200px";
}