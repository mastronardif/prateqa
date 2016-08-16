$(function() {
    $('.searchable label').hide();

    $('#flat-slider').slider({
        orientation: 'horizontal',
        range: true,
        values: [17, 67]
    });

    jQuery(document).ready(function($) {

        $('#basicExample').timepicker();

        $(document).on('click', '#btn-change', function(e) {

            var previousClass = e.target.className;
            var newClass = "glyphicon glyphicon-minus";
            $(e.target).toggleClass(newClass);

        });

        $('#ex1').bootstrapSlider({
            formatter: function(value) {
                return 'Current value: ' + value;
            }
        });

        $('#ex2').bootstrapSlider({
            formatter: function(value) {
                return 'Current value: ' + value;
            }
        });
        $('#ex3').bootstrapSlider({
            formatter: function(value) {
                return 'Current value: ' + value;
            }
        });
        $('#ex4').bootstrapSlider({
            formatter: function(value) {
                return 'Current value: ' + value;
            }
        });
        $('#ex5').bootstrapSlider({
            formatter: function(value) {
                return 'Current value: ' + value;
            }
        });
        $('#ex6').bootstrapSlider({
            formatter: function(value) {
                return 'Current value: ' + value;
            }
        });
        $('#ex7').bootstrapSlider({
            formatter: function(value) {
                return 'Current value: ' + value;
            }
        });
        $('#ex8').bootstrapSlider({
            formatter: function(value) {
                return 'Current value: ' + value;
            }
        });

        $('#ex9').bootstrapSlider({
            formatter: function(value) {
                return 'Current value: ' + value;
            }
        });

        $('#ex10').bootstrapSlider({
            formatter: function(value) {
                return 'Current value: ' + value;
            }
        });


        // $('.slider').slider()


        $("#datepicker").datepicker({
            changeMonth: true, //this option for allowing user to select month
            changeYear: true //this option for allowing user to select from year range
        });

        $("#from-datepicker").datepicker({
            changeMonth: true, //this option for allowing user to select month
            changeYear: true //this option for allowing user to select from year range
        });

        $("#to-datepicker").datepicker({
            changeMonth: true, //this option for allowing user to select month
            changeYear: true //this option for allowing user to select from year range
        });

        $('#available-byob').click(function(e) {

            var clickedItem = e.target.id;
            var div = $('#' + clickedItem)
            div.timepicker({
                hourGrid: 4,
                minuteGrid: 10,
                timeFormat: 'hh:mm tt'
            });
        });

        $('.day').click(function(e) {
            var clickedItem = e.target.innerHTML;
            var div = $('.' + clickedItem);
            div.toggleClass('highlight');

        });

        $('#filter').keyup(function() {
            var value = $('#filter').val();
            console.log(value);
            if (value) {
                var rex = new RegExp($(this).val(), 'i');
                $('.searchable label').hide();
                $('.searchable label').filter(function() {
                    return rex.test($(this).text());
                }).show();

            } else {
                $('.searchable label').hide();
            }
        });

        $('#options').click(function() {
            $('.searchable label').toggle();
        });


        $('.searchable .dietary input:checkbox').change(
            function() {

                if ($(this).is(':checked')) {
                    var p = $('<p>');
                    var checkedValue = $(this).val();
                    p.attr('data-value', checkedValue);
                    p.append(checkedValue);
                    $('#preference').append(p);
                }
            });

        $('input:checkbox').change(
            function() {
                if (!($(this).is(':checked'))) {
                    var checkedValue = $(this).val();
                    console.log(checkedValue);
                    var preference = $('#preference p');

                    for (var key in preference) {
                        var a = preference[key];
                        if (a.dataset.value === checkedValue) {
                            console.log(a);
                            a.remove();
                        }
                    }
                }
            });

    });

    $('#add-value').on('click', function() {
        console.log('add a value');

        $('#add-here').empty();
        $('#add-here').toggle();



        var inputBox = '<input type="text" class="form-control materail_input" id="add-input" placeholder="enter value">';
        $('#add-here').append(inputBox);
        var button = '<button id="add">Add</button>';
        $('#add-here').append(button);
        // var mainDiv = $('.searchable');
        // mainDiv.append(label);


    });

    $(document).on('click', '#add', function(e) {
        console.log('hello');
        var value = $('#add-input').val();
        console.log(value);

        var mainDiv = $('.searchable');
        var label = $('<label>');
        label.attr('class', 'checkbox');
        label.addClass('dietary');
        // label.css('display', 'block');
        var addInput = $('<input>');
        addInput.attr('type', 'checkbox');
        addInput.text(value);
        label.append(addInput);
        mainDiv.append(label);



    });

    $('#save').on('click', function() {
        var itemPrice = $('#price').val();
        var editButton = $('<button>');
        var span = $('<span>');
        var div = $('#price-area');
        var textbox = $('#price');
        var price = $('<div>');
        span.addClass('glyphicon glyphicon-pencil');
        span.attr('id', 'edit');
        editButton.addClass('edit');
        editButton.css('color', '#5D9D36');
        editButton.append(span);
        price.addClass('edited');
        price.html(itemPrice);
        div.append(price);
        div.append(editButton);
        textbox.hide();
        $('#save').hide();
    });

    $(document).on('click', '#edit', function(e) {
        $('#price').show();
        $('#save').show();
        $('.edited').remove();
        $('.edit').remove();
        e.preventDefault();
    });


});


(function($) {

    $.fn.rating = function() {

        var element;

        // A private function to highlight a star corresponding to a given value
        function _paintValue(ratingInput, value) {
            var selectedStar = $(ratingInput).find('[data-value=' + value + ']');
            selectedStar.removeClass('glyphicon-star-empty').addClass('glyphicon-star');
            selectedStar.prevAll('[data-value]').removeClass('glyphicon-star-empty').addClass('glyphicon-star');
            selectedStar.nextAll('[data-value]').removeClass('glyphicon-star').addClass('glyphicon-star-empty');
        }

        // A private function to remove the selected rating
        function _clearValue(ratingInput) {
            var self = $(ratingInput);
            self.find('[data-value]').removeClass('glyphicon-star').addClass('glyphicon-star-empty');
            self.find('.rating-clear').hide();
            self.find('input').val('').trigger('change');
        }

        // Iterate and transform all selected inputs
        for (element = this.length - 1; element >= 0; element--) {

            var el, i, ratingInputs,
                originalInput = $(this[element]),
                max = originalInput.data('max') || 5,
                min = originalInput.data('min') || 0,
                clearable = originalInput.data('clearable') || null,
                stars = '';

            // HTML element construction
            for (i = min; i <= max; i++) {
                // Create <max> empty stars
                stars += ['<span class="glyphicon glyphicon-star-empty" data-value="', i, '"></span>'].join('');
            }
            // Add a clear link if clearable option is set
            if (clearable) {
                stars += [
                    ' <a class="rating-clear" style="display:none;" href="javascript:void">',
                    '<span class="glyphicon glyphicon-remove"></span> ',
                    clearable,
                    '</a>'
                ].join('');
            }

            el = [
                // Rating widget is wrapped inside a div
                '<div class="rating-input">',
                stars,
                // Value will be hold in a hidden input with same name and id than original input so the form will still work
                '<input type="hidden" name="',
                originalInput.attr('name'),
                '" value="',
                originalInput.val(),
                '" id="',
                originalInput.attr('id'),
                '" />',
                '</div>'
            ].join('');

            // Replace original inputs HTML with the new one
            originalInput.replaceWith(el);

        }

        // Give live to the newly generated widgets
        $('.rating-input')
            // Highlight stars on hovering
            .on('mouseenter', '[data-value]', function() {
                var self = $(this);
                _paintValue(self.closest('.rating-input'), self.data('value'));
            })
            // View current value while mouse is out
            .on('mouseleave', '[data-value]', function() {
                var self = $(this);
                var val = self.siblings('input').val();
                if (val) {
                    _paintValue(self.closest('.rating-input'), val);
                } else {
                    _clearValue(self.closest('.rating-input'));
                }
            })
            // Set the selected value to the hidden field
            .on('click', '[data-value]', function(e) {
                var self = $(this);
                var val = self.data('value');
                self.siblings('input').val(val).trigger('change');
                self.siblings('.rating-clear').show();
                e.preventDefault();
                false
            })
            // Remove value on clear
            .on('click', '.rating-clear', function(e) {
                _clearValue($(this).closest('.rating-input'));
                e.preventDefault();
                false
            })
            // Initialize view with default value
            .each(function() {
                var val = $(this).find('input').val();
                if (val) {
                    _paintValue(this, val);
                    $(this).find('.rating-clear').show();
                }
            });

    };

    // Auto apply conversion of number fields with class 'rating' into rating-fields
    $(function() {
        if ($('input.rating[type=number]').length > 0) {
            $('input.rating[type=number]').rating();
        }
    });

}(jQuery));
