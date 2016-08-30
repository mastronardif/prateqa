
$(function(){
        // Create the tree inside the <div id="tree"> element.
          $("#tree").fancytree({
            source: JSON.parse($(tree).attr('data')),
            checkbox: true,
            extensions: ["table"],
            table: {
                // indent every node level by 16px
                nodeColumnIdx: 1         // render node expander, icon, and title to this column (default: #0)
            },
            click: function(event, data){
              if (!data.node.folder && data.targetType === "title"){
              var itemName = data.node.title.replace(/<(?:.|\n)*?>/gm, '')
              // var ratingHTML = getRatingHTML(data.node.data.rating)
              // var reviewCount = data.node.data.reviews
              updateData(itemName)
              }
            },
            expand: function(event, data){
              data.node.children.forEach(function(child){
                if (!child.children){
                var title = child.title
                child.setTitle('<span style="color:blue; text-decoration:underline">' + title + '</span>')
              }})
              $('.fancytree-icon').hide()
            },
          renderColumns: function(event, data) {
          var node = data.node,
              $tdList = $(node.tr).find(">td");
              
          // (index #0 is rendered by fancytree by adding the checkbox)
          var properties = node.data;
          
          // (index #2 is rendered by fancytree)
          // Make the title cell span the remaining columns, if it is a "folder:"
          $tdList.eq(2)
              .html(getRatingHTML(properties.rating))
              .addClass("alignRight");
          $tdList.eq(3)
              .text(properties.reviews)
              .addClass("alignRight");
           $tdList.eq(4)
              .text(properties.range || properties.price)
              .addClass("alignRight");
        },
        renderNode: function(event, data){
          if (data.node.children && data.node.children.length > 0){
            data.options.checkbox = false
            data.node.hideCheckbox = true
          }
          else {
            data.options.checkbox = true
            data.node.hideCheckbox = false
          }
        }
        });
        });
        $(window).bind("load", function(){
          $.getScript('/js/socialshare.js', function(){})
        })
        
        $(document).ready(function(){
          setRatings()
          updateMain()
          visitRatingsPage()
          $('.fancytree-icon').hide()
        });
        var setRatings = function(){
          $('.fixed-rating').each(function(index, div){
            var rating = div.id
            var html = getRatingHTML(rating)
            $(div).html(html)
          })
        }
        var updateMain = function(){
          $('tr').click(function(){
          if (!$(this).hasClass('fancytree-folder')){ 
          var itemName = $(this).find('.item-name').text();
          var ratingHTML = $(this).find('.fixed-rating').html();
          var reviewCount = $(this).find('.number-of-reviews').text();
          var id = this.id
          updateData(itemName, ratingHTML, reviewCount, id);
        }})
        };
        var getRatingHTML = function(rating){
          var html = ""
          for (i = 0; i < rating; i++){
              html += '<span class="glyphicon glyphicon-star"></span>'
          }
          for (i = 0; i < (5 - rating); i++){
              html += '<span class="glyphicon glyphicon-star glyphicon-star-empty"></span>'
          }
          return html
        };
        var updateData = function(itemName){
          var displayedItem = $('#menu-item-info')
          displayedItem.find('h2').text(itemName)
          // displayedItem.find('.fixed-rating').html(ratingHTML)
          // displayedItem.find('#review-count').text(reviewCount + ' reviews')
          // displayedItem.find('img').attr('src', '../../images/' + id + '.jpg')
          $('html, body').animate({scrollTop : 0},800);
        } 
        var visitRatingsPage = function(){
          $('.rate-items-btn').click(function(){
            
            var nodes = $('#tree').fancytree('getTree').getSelectedNodes()
            var data = []
            nodes.forEach(function(node){
              data.push(node.data.entryId)
            })
            console.log(data)
            $.ajax({
              method: 'GET',
              url: '/ratings/new',
              data: {data},
              success: function(response){
                $('body').html(response)
              },
              error: function(jqXHR, textStatus, err) {
                //show error message
                alert('text status '+textStatus+', err '+err)
              }
            })
          })
          
        }
