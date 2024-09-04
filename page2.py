def process_page2(request):
    input1 = request.form.get('input1')
    input2 = request.form.get('input2')

    # Example logic for processing the inputs
    if not input1 or not input2:
        return 'Missing input fields', 400

    # Here you can add any processing logic you need
    message = f'Received: Input 1 = {input1}, Input 2 = {input2}'
    return message, 200