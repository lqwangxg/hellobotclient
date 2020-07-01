export default {
  inserted: function(el) {
    console.log(el);
    // el.addEventListener("dragend", (e)=>{
    //   el.style = {
    //     position: "absolute",
    //     left: e.screenX +"px",
    //     top: e.screenY +"px"
    //   }
    //   console.log(`dragend event=======>:${el}, ${e.clientX},${e.clientY},${e.screenX},${e.screenY}`);
    // });

    // el.addEventListener("dragstart", (e)=>{
    //   //el.style.cursor = "move";
    //   console.log(`dragstart event=======>:${el},${e.clientX},${e.clientY},${e.screenX},${e.screenY}`);      
    // });

    // el.addEventListener("mousedown", onMouseDown);
    // el.addEventListener("mousemove", (e)=>{
    //     el.style = {
    //       //position: "absolute",
    //       left: e.offsetX +"px",
    //       top: e.screenY +"px"
    //     }
    // });
    // el.addEventListener("mouseup", ()=> { 
    //   isMove = false;
    //   el.style.cursor = "auto";
    // });
    
    // let posX, posY, mosX, mosY;
    // let isMove = false;
    
    // function onMouseDown(e) {
    //   el.style.cursor = "move";

    //   posX = e.offsetX;
    //   posY = e.offsetY;
    //   mosX = e.pageX;
    //   mosY = e.pageY;
      
    //   console.log(`mousedown x, y:,el, e.offsetX, e.offsetY`)
     
    //   isMove = true;
    //   return false;
    // }

    // function onMouseMove(e) {
    //   if (isMove) {
    //     el.style.cursor = "move";

    //     let x = posX + e.clientX - mosX;
    //     let y = posY + e.clientY - mosY;
        
    //     el.style.left = x + "px";
    //     el.style.top = y + "px";
    //     console.log("mousemove x, y, left, top:", el, e.offsetX, e.offsetY,x, y);
    //   }else{
    //     return false;
    //   }
    // }
  },
};
