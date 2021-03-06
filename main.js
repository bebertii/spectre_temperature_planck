let h=6.62607015e-34; //constante de Planck (J.s)
let c=3e8; //vitesse de la lumière (m.s-1)
let k=1.380649e-23; // constante de Boltzmann (J.K-1)
let temperature=800; // température en kelvin
let intensites=[];
let intensite_maxi=10;

onmousemove = function(e){
    let mouse_x=e.clientX;
    let mouse_y=e.clientY;
    let rect = document.getElementById("graphe").getBoundingClientRect();
    //console.log(rect.top, rect.left, rect.right, rect.bottom);
    if (mouse_x>rect.left && mouse_x<rect.right && mouse_y>rect.top &&  mouse_y<rect.bottom){
        update_graph();
        reticule(mouse_x-rect.left,mouse_y-rect.top);
    }
}
window.onload=function(){update();};
var horloge = window.setInterval('redim_conteneur();' , 100);
document.getElementById("thermometre").oninput=function(){update();};

function update(){
     temperature=logslider(document.getElementById("thermometre").value*1)
    document.getElementById("temp").innerHTML=logslider(document.getElementById("thermometre").value*1);
    update_spectre();
    update_graph();
    document.getElementById("objet").style.backgroundColor=update_object();
}


// échelle logarithmique pour le sélecteur de température
function logslider(position) {//trouvé ici : https://stackoverflow.com/questions/846221/logarithmic-slider
    // position will be between 0 and 100
    var minp = 0;
    var maxp = 1000;
  
    // The result should be between 100 an 10000000
    var minv = Math.log(500);
    var maxv = Math.log(20000);
  
    // calculate adjustment factor
    var scale = (maxv-minv) / (maxp-minp);
  
    return Math.floor(Math.exp(minv + scale*(position-minp)));
}


// rechche du maximum dans une liste
function maximum(liste){
    maxi=liste[0]
    for (var i=0;i<liste.length;i++){
        if (liste[i]>maxi){
            maxi=liste[i]
        }
    }
    return maxi
}

function planck(lmbda,T){
    /*
    Wikipédia : La luminance énergétique spectrale d'une surface est le flux énergétique émis par la surface par unité d'aire de la surface projetée,
    par unité d'angle solide, par unité spectrale (fréquence, longueur d'onde, période, nombre d'onde et leurs équivalents angulaires).
    S'exprime en W.m^−2.sr^−1.s dans le Système international d'unités (sr = stéradian)
    */
    return 2*h*Math.pow(c,2)/(Math.pow(lmbda,5)*Math.expm1(h*c/(lmbda*k*T)))
}

function redim_conteneur(){
    
    document.getElementById("conteneur").style.width=Math.min(window.innerHeight*0.85,window.innerWidth*.95)+"px";
}

function wien(T){
    //Applique la loi de Wien pour retourner la langueur d'onde du maximum d'émission
    return 2.898e-3/T
}

function update_object(){
  facteur=1.0;
  if (temperature<6600){
    if (temperature<3000){facteur=(temperature-500)/(2500)}
    rouge=255;
    vert=99.47*Math.log(temperature/100)-161.12;
    if (temperature<2000) {bleu=0;}
    else {bleu=138.52*Math.log(temperature/100-10)-305.04;}
  }
  else {
    rouge=329.67*Math.pow(temperature/100-60,-0.1332047592);
    vert=288.12*Math.pow(temperature/100-60,-0.0755148492);
    bleu=255;
  }
  //console.log("rgb("+rouge+","+vert+","+bleu+","+")");
  rouge=facteur*rouge;
  vert=facteur*vert;
  bleu=facteur*bleu;
  return "rgb("+rouge+","+vert+","+bleu+")";
}

function update_spectre(){
    context=document.getElementById("spectre").getContext("2d");
    
    //définition des dimensions du canvas
    document.getElementById("spectre").width=1400;
    document.getElementById("spectre").height=250;
    document.getElementById("spectre").style.width="100%";

    //dessin du background
    context.fillStyle="#000000";
    context.fillRect(100,0,1200,200); // fond de spectre
    context.strokeStyle="#000000";
    
    //tacé de l'axe
    context.lineWidth=3;
    context.beginPath();
    context.moveTo(0,210);
    context.lineTo(1397,210);
    context.moveTo(1400,210);
    context.lineTo(1385,195);
    context.moveTo(1400,210);
    context.lineTo(1385,265);
    context.stroke()
    
    context.font = "30px Arial";
    context.fillText("λ(nm)",1305,200);
    context.font = "20px Arial";
    context.lineWidth=5;

    //graduations principales + valeurs
    context.beginPath();
    for (var i=0;i<=9;i++){
     context.moveTo(100+i*1200/9,205);
     context.lineTo(100+i*1200/9,215);
     context.fillText(350+50*i,85+i*1200/9,240);
    }
    context.stroke();
    
    //graduations secondaires
    context.beginPath();
    context.lineWidth=1;
    for (var i=0;i<=45;i++){
     context.moveTo(100+i*1200/45,205);
     context.lineTo(100+i*1200/45,215);
    }
    context.stroke();
    
    //calcul des intensités des longueurs d'ondes tracées
    intensites=[];
    for (var i=350;i<800;i+=.75){
        intensites.push(planck(i*Math.pow(10,-9),temperature));
    }
    intensite_maxi=maximum(intensites);
    for (var i=0;i<intensites.length;i++){
        intensites[i]=intensites[i]/maxi;
    }
    
    for (var i=350;i<800;i+=.75){
        context.fillStyle=nmToRGB(i,intensites[(i-350)*4/3]);
        context.fillRect(100+1200*(i-350)/450,00,2,200)
    		
    }

}

function reticule(x,y){
    //tracer d'un réticule sur le spectrogramme
    cnv=document.getElementById("graphe");
    context=cnv.getContext("2d");
    //on calcule les dimensions réelles du spectrogramme à l'écran
    dimensions=cnv.getBoundingClientRect();
    largeur=dimensions.right-dimensions.left;
    hauteur=dimensions.bottom-dimensions.top;
    // on détermine le rapport de réduction afin de placer
    // le réticule sous le curseur de la souris
    // dont la position relative a été donnée en paramètre
    reduction_x=1400/largeur
    reduction_y=800/hauteur
    souris_x=x*reduction_x
    souris_y=y*reduction_y
    context.setLineDash([5, 5]);
    context.lineWidth=3;
    context.strokeStyle="#ddd";
    context.beginPath();
    context.moveTo(80,souris_y);
    context.lineTo(souris_x,souris_y);
    context.lineTo(souris_x,760);
    context.stroke()

}

function update_graph(){
    context=document.getElementById("graphe").getContext("2d");
    
    //définition des dimensions du canvas
    document.getElementById("graphe").width=1400;
    document.getElementById("graphe").height=800;
    document.getElementById("graphe").style.width="100%";

    //dessin du background
    context.fillStyle="#000000";
    context.fillRect(100,50,1200,700); // fond de spectre
    context.strokeStyle="#000000";
    
    //tacé de l'axe horizontal
    context.lineWidth=3;
    context.strokeStyle="#000000";
    context.beginPath();
    context.moveTo(60,760);
    context.lineTo(1397,760);
    context.moveTo(1400,760);
    context.lineTo(1385,745);
    context.moveTo(1400,760);
    context.lineTo(1385,775);
    context.stroke();
    
    context.font = "30px Arial";
    context.fillText("λ(nm)",1305,750);
    context.font = "20px Arial";
    context.lineWidth=5;

    //graduations principales + valeurs
    context.beginPath();
    for (var i=0;i<=9;i++){
     context.moveTo(100+i*1200/9,755);
     context.lineTo(100+i*1200/9,765);
     context.fillText(350+50*i,85+i*1200/9,790);
    }
    context.stroke();
    
    //graduations secondaires
    context.beginPath();
    context.lineWidth=1;
    for (var i=0;i<=45;i++){
     context.moveTo(100+i*1200/45,755);
     context.lineTo(100+i*1200/45,765);
    }
    context.stroke();

    //tracé des valeurs, les intensités maximales ont déjà été calculées et mises à jour dans la fonction précédente
    for (var i=350;i<800;i+=.75){
        if (i>=380 && i<=780){
        context.fillStyle=nmToRGB(i);
        context.fillRect(100+1200*(i-350)/450,50+700*(1-intensites[(i-350)*4/3]),2,700*intensites[(i-350)*4/3]);
        }
        else {
            context.lineWidth=2;
            context.beginPath();
            context.strokeStyle="rgb(255,255,255)";
            context.moveTo(100+1200*(i-350)/450,50+700*(1-intensites[(i-350)*4/3])+1);
            context.lineTo(100+1200*(i-350)/450+2,50+700*(1-intensites[1+(i-350)*4/3])+1);
            context.stroke();

        }
        
    		
    }

    //tacé de l'axe vertical
    context.lineWidth=3;
    context.strokeStyle="#000000";
    context.fillStyle="#000000";
    context.beginPath();
    context.moveTo(80,780);
    context.lineTo(80,20);
    context.lineTo(65,35);
    context.moveTo(80,20);
    context.lineTo(95,35);
    context.stroke();
    
    context.font = "30px Arial";
    context.fillText("L [W.s/(m².sr)]",100,30);
    val_top=Math.floor(Math.log(intensite_maxi)/Math.log(10));
    context.fillText("x10",300,30);
    context.font = "20px Arial";
    context.fillText(val_top,350,15);
    context.font = "20px Arial";
    context.lineWidth=5;

    //graduations principales + valeurs
    
    

    nb=0;
    context.lineWidth=3;
    context.strokeStyle="#000000";
    context.fillStyle="#000000";
    context.beginPath();
    while (nb*Math.pow(10,val_top)<intensite_maxi){
        
        context.moveTo(70,50+700*(1-nb*Math.pow(10,val_top)/intensite_maxi));
        context.lineTo(90,50+700*(1-nb*Math.pow(10,val_top)/intensite_maxi));
        context.fillText(nb,10,50+700*(1-nb*Math.pow(10,val_top)/intensite_maxi));
        nb++;
    }
    context.stroke();
    
    //graduations secondaires
    context.lineWidth=1;
    context.strokeStyle="#000000";
    context.fillStyle="#000000";
    
    if (nb<=2){sub=10}
    else if (nb<=4){sub=5}
    else if (nb<=8){sub=2}
    else {sub=1}
        context.beginPath();
        nb=0
        while (nb*Math.pow(10,val_top)<intensite_maxi*sub){
            
            context.moveTo(70,50+700*(1-nb*Math.pow(10,val_top)/(intensite_maxi*sub)));
            context.lineTo(80,50+700*(1-nb*Math.pow(10,val_top)/(intensite_maxi*sub)));
            
            nb++;
        }
        context.stroke();
    
}




function nmToRGB(wavelength,alpha){ // code trouvé sur https://academo.org/demos/wavelength-to-colour-relationship/
    if( typeof(alpha) == 'undefined' ){
        alpha = 1;
    }
    var Gamma = 0.80,
    IntensityMax = 255,
    factor, red, green, blue;
    if((wavelength >= 380) && (wavelength<440)){
        red = -(wavelength - 440) / (440 - 380);
        green = 0.0;
        blue = 1.0;
    }
    else if((wavelength >= 440) && (wavelength<490)){
        red = 0.0;
        green = (wavelength - 440) / (490 - 440);
        blue = 1.0;
    }
    else if((wavelength >= 490) && (wavelength<510)){
        red = 0.0;
        green = 1.0;
        blue = -(wavelength - 510) / (510 - 490);
    }
    else if((wavelength >= 510) && (wavelength<580)){
        red = (wavelength - 510) / (580 - 510);
        green = 1.0;
        blue = 0.0;
    }
    else if((wavelength >= 580) && (wavelength<645)){
        red = 1.0;
        green = -(wavelength - 645) / (645 - 580);
        blue = 0.0;
    }
    else if((wavelength >= 645) && (wavelength<781)){
        red = 1.0;
        green = 0.0;
        blue = 0.0;
    }
    else{
        red = 0.0;
        green = 0.0;
        blue = 0.0;
    };
    // Let the intensity fall off near the vision limits
    if((wavelength >= 380) && (wavelength<420)){
        factor = 0.3 + 0.7*(wavelength - 380) / (420 - 380);
    }else if((wavelength >= 420) && (wavelength<701)){
        factor = 1.0;
    }else if((wavelength >= 701) && (wavelength<781)){
        factor = 0.3 + 0.7*(780 - wavelength) / (780 - 700);
    }else{
        factor = 0.0;
    };
    if (red !== 0){
        red = Math.round(IntensityMax * Math.pow(red * factor, Gamma));
    }
    if (green !== 0){
        green = Math.round(IntensityMax * Math.pow(green * factor, Gamma));
    }
    if (blue !== 0){
        blue = Math.round(IntensityMax * Math.pow(blue * factor, Gamma));
    }
    return "rgba("+red+","+green+","+blue+","+alpha+")";}